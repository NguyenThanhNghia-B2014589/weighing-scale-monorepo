// src/hooks/useHistoryPage.ts

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { CellMeasurerCache } from 'react-virtualized';
import { useAutoRefresh } from "./useAutoRefresh";
import apiClient from "../api/apiClient";

// Định nghĩa kiểu dữ liệu từ backend
export interface GroupedHistoryData {
  ovNO: string;
  memo: string;
  totalTargetQty: number;
  totalNhap: number;
  totalXuat: number;
  y_TotalPackages: number;
  x_WeighedNhap: number; // Giả định trường này tồn tại, dựa trên code cũ của bạn
  records: HistoryRecord[];
}

export interface HistoryRecord {
  maCode: string;
  mixTime: string;
  realQty: number;
  loai: string;
  ovNO: string;
  package: number; // Đổi thành number
  MUserID: string;
  qtys: number;
  tenPhoiKeo: string;
  soMay: string;
  totalTargetQty: number;
  Memo: string;
  nguoiThaoTac: string;
  soLo: number; // Đổi thành number
}

export function useAdminPageLogic() {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedName, setSelectedName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Tiêu đề bảng
  // Cập nhật tiêu đề bảng để khớp với hình ảnh (9 cột)
  const tableHeaders = [
    "Mã Code", 
    "Tên Phôi Keo", 
    "Số Lô", 
    "Số Máy", 
    "Người Thao Tác", 
    "Thời Gian Cân", 
    "KL Mẻ(kg)", 
    "KL Đã Cân(kg)",
    "Loại Cân"
  ];
 
  // Quản lý dữ liệu lịch sử
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistoryData[]>([]);

  // Cache cho react-virtualized
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 80 // Giữ nguyên hoặc điều chỉnh nếu cần
    })
  );

  // --- LOGIC LẤY DỮ LIỆU TỪ API ---
  const fetchData = useCallback(async () => {
    try {
      const response = await apiClient.get<GroupedHistoryData[]>('/history');
      // Sắp xếp các bản ghi trong mỗi nhóm theo thời gian mới nhất
      const sortedData = response.data.map(group => ({
        ...group,
        records: group.records.sort((a, b) => new Date(b.mixTime).getTime() - new Date(a.mixTime).getTime())
      }));
    setGroupedHistory(sortedData);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử cân:", error);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LOGIC LÀM MỚI DỮ LIỆU ---
  const { 
    isAutoRefresh,
    setIsAutoRefresh,
    lastRefresh, 
    formatLastRefresh,
    refreshData,
  } = useAutoRefresh(fetchData, {});

  // --- CÁC LOGIC KHÁC ---
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Lấy danh sách tên phôi keo duy nhất
  const uniqueNames = useMemo(() => {
    const names = new Set<string>();
    groupedHistory.forEach(group => {
      group.records.forEach(record => {
        if (record.tenPhoiKeo) names.add(record.tenPhoiKeo);
      });
    });
    return Array.from(names);
  }, [groupedHistory]);

  // Hàm kiểm tra ngày
  const isDateMatch = useCallback((timestamp: string, selectedDate: string): boolean => {
    if (!selectedDate) return true;
    
    const date = new Date(timestamp);
    const dateStr = date.toISOString().substring(0, 10);
    
    return dateStr === selectedDate;
  }, []);

  // Lọc dữ liệu (vẫn lọc theo nhóm)
  const filteredHistory = useMemo(() => {
    return groupedHistory.filter((group) => {
      // Nếu không chọn tên phôi keo => hiển thị tất cả
      if (!selectedName || selectedName === '') return true;

      // Nếu chọn tên phôi keo => chỉ cần group có record trùng tên là hiển thị toàn bộ group
      const hasMatchingName = group.records.some(r => r.tenPhoiKeo === selectedName);

      // Lọc theo ngày (nếu có)
      const hasMatchingDate = !selectedDate || 
        group.records.some(r => isDateMatch(r.mixTime, selectedDate));

      // Lọc theo từ khóa (nếu có)
      const hasMatchingSearch = !debouncedTerm ||
        group.ovNO.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
        (group.memo?.toLowerCase() ?? "").includes(debouncedTerm.toLowerCase()) ||
        group.records.some(r =>
          (r.maCode?.toLowerCase().includes(debouncedTerm.toLowerCase())) ||
          (r.tenPhoiKeo?.toLowerCase().includes(debouncedTerm.toLowerCase())) ||
          (r.soLo?.toString().includes(debouncedTerm)) ||
          (r.soMay?.toLowerCase().includes(debouncedTerm.toLowerCase())) ||
          (r.nguoiThaoTac?.toLowerCase().includes(debouncedTerm.toLowerCase()))
        );

      // ✅ Giữ lại toàn bộ nhóm nếu nó có tên trùng (và match các filter khác)
      return hasMatchingName && hasMatchingDate && hasMatchingSearch;
    });
  }, [debouncedTerm, groupedHistory, selectedName, selectedDate, isDateMatch]);

  return {
    tableHeaders,
    searchTerm,
    setSearchTerm,
    isPageLoading,
    filteredHistory, // Vẫn trả về
    cache: cache.current,
    uniqueNames,
    selectedName,
    setSelectedName,
    selectedDate,
    setSelectedDate,
    formatLastRefresh,
    lastRefresh,
    isAutoRefresh,
    setIsAutoRefresh,
    refreshData,
  };
}
export type AdminPageLogicReturn = ReturnType<typeof useAdminPageLogic>;