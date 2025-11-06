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
    try {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      return localDateStr === selectedDate;
    } catch (error) {
      console.error("Lỗi format ngày:", error, timestamp);
      return false;
    }
 }, []);


  // Lọc dữ liệu (vẫn lọc theo nhóm)
  const filteredHistory = useMemo(() => {
    const lowerCaseTerm = debouncedTerm.toLowerCase();

  return groupedHistory.filter((group) => {
   
   // 1. Kiểm tra Tên (Đã đúng)
   const nameMatch = !selectedName || group.records.some(r => r.tenPhoiKeo === selectedName);

   // 2. Kiểm tra Ngày (Đã đúng)
   const dateMatch = !selectedDate || 
    group.records.some(r => isDateMatch(r.mixTime, selectedDate));

   // 3. Kiểm tra Tìm kiếm (ĐÃ SỬA LỖI TYPO)
   const searchMatch = !lowerCaseTerm ||
    (group.ovNO && group.ovNO.toLowerCase().includes(lowerCaseTerm)) ||
    group.records.some(r =>
     (r.maCode && r.maCode.toLowerCase().includes(lowerCaseTerm)) ||
            // SỬA LỖI Ở ĐÂY:
            // Sai: r.tenPhoiKeo.toLowerCase(lowerCaseTerm)
            // Đúng: r.tenPhoiKeo.toLowerCase().includes(lowerCaseTerm)
     (r.tenPhoiKeo && r.tenPhoiKeo.toLowerCase().includes(lowerCaseTerm)) ||
     (r.soLo && r.soLo.toString().includes(lowerCaseTerm)) ||
     (r.soMay && r.soMay.toLowerCase().includes(lowerCaseTerm)) ||
     (r.nguoiThaoTac && r.nguoiThaoTac.toLowerCase().includes(lowerCaseTerm)) ||
     (r.loai && r.loai.toLowerCase().includes(lowerCaseTerm))
    );

   // 4. Trả về kết quả của CẢ BA
   return nameMatch && dateMatch && searchMatch;
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
    isDateMatch
  };
}
export type AdminPageLogicReturn = ReturnType<typeof useAdminPageLogic>;