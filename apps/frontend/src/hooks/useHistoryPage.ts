// src/hooks/useHistoryPage.ts

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { CellMeasurerCache } from 'react-virtualized';
import { Variants } from 'framer-motion';
import { useAutoRefresh } from "./useAutoRefresh";
import apiClient from "../api/apiClient";

// Định nghĩa kiểu dữ liệu từ backend
interface GroupedHistoryData {
  ovNO: string;
  memo: string;
  totalTargetQty: number;
  totalNhap: number;
  totalXuat: number;
  y_TotalPackages: number;
  x_WeighedNhap: number;
  records: HistoryRecord[];
}

interface HistoryRecord {
  maCode: string;
  mixTime: string;
  realQty: number;
  loai: string;
  ovNO: string;
  package: string;
  MUserID: string;
  qtys: number;
  tenPhoiKeo: string;
  soMay: string;
  totalTargetQty: number;
  Memo: string;
  nguoiThaoTac: string;
  soLo: string;
}

export function useAdminPageLogic() {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedName, setSelectedName] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  // Tiêu đề bảng
  const tableHeaders = [
    "OVNO", 
    "Memo", 
    "Tên Phôi Keo", 
    "Tổng Mục Tiêu (kg)", 
    "Tổng Nhập (kg)", 
    "Tổng Xuất (kg)", 
    "Tiến độ", 
    "Số Mẻ"
  ];
  
  // Quản lý dữ liệu lịch sử
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistoryData[]>([]);

  // Cache cho react-virtualized
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 80
    })
  );

  // --- LOGIC LẤY DỮ LIỆU TỪ API ---
  const fetchData = useCallback(async () => {
    try {
      const response = await apiClient.get<GroupedHistoryData[]>('/history');
      setGroupedHistory(response.data);
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
    
    // timestamp format: "2025-11-05T10:30:00.000Z"
    const date = new Date(timestamp);
    const dateStr = date.toISOString().substring(0, 10);
    
    return dateStr === selectedDate;
  }, []);

  // Lọc dữ liệu
  const filteredHistory = useMemo(() => {
    return groupedHistory.filter((group) => {
      // Lọc theo tên phôi keo
      const nameMatch = selectedName === 'all' || 
        group.records.some(r => r.tenPhoiKeo === selectedName);
      
      // Lọc theo ngày
      const dateMatch = !selectedDate || 
        group.records.some(r => isDateMatch(r.mixTime, selectedDate));
      
      // Lọc theo từ khóa tìm kiếm
      const searchMatch = !debouncedTerm || 
        group.ovNO.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
        group.memo?.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
        group.records.some(r => 
          r.tenPhoiKeo?.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
          r.soMay?.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
          r.nguoiThaoTac?.toLowerCase().includes(debouncedTerm.toLowerCase())
        );
      
      return nameMatch && dateMatch && searchMatch;
    });
  }, [debouncedTerm, groupedHistory, selectedName, selectedDate, isDateMatch]);

  // Animation variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', duration: 0.8, bounce: 0.4 } 
    },
  };

  return {
    tableHeaders,
    searchTerm,
    setSearchTerm,
    isPageLoading,
    filteredHistory,
    cache: cache.current,
    cardVariants,
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