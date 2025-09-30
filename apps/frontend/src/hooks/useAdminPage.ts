// src/hooks/useAdminPage.ts

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { CellMeasurerCache } from 'react-virtualized';
import { Variants } from 'framer-motion';
import { useAutoRefresh } from "./useAutoRefresh";
import apiClient from "../api/apiClient";
import { HistoryRecord } from "../data/weighingHistoryData";

export function useAdminPageLogic() {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedName, setSelectedName] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Quản lý dữ liệu lịch sử bằng useState để có thể làm mới
  const [weighingHistory, setWeighingHistory] = useState<HistoryRecord[]>([]);

  // Di chuyển cache vào useRef để tránh tạo lại không cần thiết
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 250 // Chiều cao mặc định ban đầu
    })
  );

    // --- LOGIC LẤY DỮ LIỆU TỪ API ---
  const fetchData = useCallback(async () => {
    try {
      // Gọi đến GET /api/history. apiClient sẽ tự động thêm token
      const response = await apiClient.get<HistoryRecord[]>('/history');
      // Sắp xếp dữ liệu trả về từ server (nếu cần)
      const sortedData = response.data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setWeighingHistory(sortedData);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử cân:", error);
      // Có thể hiển thị thông báo lỗi ở đây
    } finally {
      setIsPageLoading(false); // Dừng màn hình skeleton sau lần tải đầu tiên
    }
  }, []); // useCallback với mảng rỗng để hàm này không bị tạo lại

  // useEffect để lấy dữ liệu lần đầu tiên khi component được tải
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LOGIC LÀM MỚI DỮ LIỆU ---

  // Sử dụng hook useAutoRefresh, chỉ kích hoạt thủ công
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
      const searchMatch = !debouncedTerm || [item.code, item.solo, item.somay, item.user_name].some((field) => field.toLowerCase().includes(debouncedTerm.toLowerCase()));
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
    formatLastRefresh,
    lastRefresh,
    isAutoRefresh,
    setIsAutoRefresh,
    refreshData,
  };
}