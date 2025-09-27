// src/hooks/useAdminPage.ts

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { mockApiRandomData } from "../data/weighingData";
import { CellMeasurerCache } from 'react-virtualized';
import { Variants } from 'framer-motion';
import { useAutoRefresh } from "./useAutoRefresh";

export function useAdminPageLogic() {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedName, setSelectedName] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Quản lý dữ liệu lịch sử bằng useState để có thể làm mới
const [weighingHistory, setWeighingHistory] = useState(() => Object.values(mockApiRandomData));

  // Di chuyển cache vào useRef để tránh tạo lại không cần thiết
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 250 // Chiều cao mặc định ban đầu
    })
  );

  // --- LOGIC LÀM MỚI DỮ LIỆU ---
  // Định nghĩa hành động làm mới
  const dataRefreshCallback = useCallback(() => {
    setWeighingHistory(Object.values(mockApiRandomData));
  }, []);

  // Sử dụng hook useAutoRefresh, chỉ kích hoạt thủ công
  const { 
    isAutoRefresh,
    setIsAutoRefresh,
    refreshData, 
    lastRefresh, 
    formatLastRefresh 
  } = useAutoRefresh(
    dataRefreshCallback,
    { }
  );
  // --- CÁC LOGIC KHÁC ---
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fake loading ban đầu
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Lấy danh sách tên duy nhất cho dropdown
  const uniqueNames = useMemo(() => [...new Set(weighingHistory.map(item => item.name))], [weighingHistory]);

  // Lọc dữ liệu để hiển thị
  const filteredHistory = useMemo(() => {
    return weighingHistory.filter((item) => {
      const nameMatch = selectedName === 'all' || item.name === selectedName;
      const dateMatch = !selectedDate || item.time.includes(selectedDate.split('-').reverse().join('/'));
      const searchMatch = !debouncedTerm || [item.code, item.solo, item.somay, item.user].some((field) => field.toLowerCase().includes(debouncedTerm.toLowerCase()));
      return nameMatch && dateMatch && searchMatch;
    });
  }, [debouncedTerm, weighingHistory, selectedName, selectedDate]);

  // Logic animation
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', duration: 0.8, bounce: 0.4 } 
    },
  };

  // --- TRẢ VỀ CÁC GIÁ TRỊ VÀ HÀM ---
  return {
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
    refreshData,
    formatLastRefresh,
    lastRefresh,
    isAutoRefresh,
    setIsAutoRefresh,
  };
}