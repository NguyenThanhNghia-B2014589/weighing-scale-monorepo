// apps/frontend/src/hooks/useDashboard.ts

import { useMemo, useState, useCallback, useEffect } from "react";
import { useAutoRefresh } from "./useAutoRefresh";
import apiClient from "../api/apiClient";

// Định nghĩa kiểu dữ liệu cho API mới
interface InventorySummary {
  summary: {
    totalNhap: number;
    totalXuat: number;
    totalTon: number;
  };
  byGlueType: Array<{
    tenPhoiKeo: string;
    nhap: number;
    xuat: number;
    ton: number;
  }>;
}

interface ShiftWeighingData {
 Ca: string;
 KhoiLuongNhap: number;
 KhoiLuongXuat: number;
}

interface WeighingTrendData {
  Thang: number;
  TongKhoiLuongNhap: number;
  TongKhoiLuongXuat: number;
}

// Lấy năm hiện tại
function getCurrentYear(): string {
  return new Date().getFullYear().toString();
}

function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useDashboard() {
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [shiftData, setShiftData] = useState<ShiftWeighingData[]>([]);
  const [trendData, setTrendData] = useState<WeighingTrendData[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  // Callback để làm mới dữ liệu tồn kho (biểu đồ tròn)
  const fetchInventorySummary = useCallback(async () => {
    try {
      const response = await apiClient.get<InventorySummary>('/dashboard/inventory-summary');
      setInventorySummary(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu tồn kho:", error);
    }
  }, []);

  // Callback để làm mới dữ liệu cân theo giờ (biểu đồ cột)
  const fetchShiftWeighing = useCallback(async (date: string) => {
    try {
      // API endpoint giữ nguyên, nhưng kiểu trả về đã thay đổi
      const response = await apiClient.get<ShiftWeighingData[]>('/dashboard/shift-weighing', {
      params: { date }
    });
    setShiftData(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu cân theo ca:", error);
    }
  }, []);

  // Callback để làm mới xu hướng (biểu đồ diện tích)
  const fetchWeighingTrend = useCallback(async () => {
    try {
      const response = await apiClient.get<WeighingTrendData[]>('/dashboard/weighing-trend', {
        params: { year: selectedYear } // 2. Gửi năm lên API
      });
      setTrendData(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy xu hướng cân:", error);
    }
  }, [selectedYear]);

  // Callback tổng hợp để làm mới TẤT CẢ dữ liệu
  const dataRefreshCallback = useCallback(async () => {
    await Promise.all([
      fetchInventorySummary(),
      fetchShiftWeighing(selectedDate),
      fetchWeighingTrend()
    ]);
  }, [fetchInventorySummary, fetchShiftWeighing, fetchWeighingTrend, selectedDate]);

  // Lấy dữ liệu lần đầu
  useEffect(() => {
    dataRefreshCallback();
  }, [dataRefreshCallback]);

  // Cập nhật dữ liệu cân theo giờ khi thay đổi ngày
  useEffect(() => {
    fetchShiftWeighing(selectedDate);
  }, [selectedDate, fetchShiftWeighing]);

  // Sử dụng hook useAutoRefresh
  const {
    isAutoRefresh,
    refreshInterval,
    lastRefresh,
    refreshData,
    setIsAutoRefresh,
    setRefreshInterval,
    formatLastRefresh,
  } = useAutoRefresh(dataRefreshCallback, {});

  // --- XỬ LÝ DỮ LIỆU CHO TWO LEVEL PIE CHART ---
  const twoLevelPieData = useMemo(() => {
    if (!inventorySummary) return null;

    const { summary, byGlueType } = inventorySummary;

    // Vòng trong: Tổng quan (Tồn và Xuất)
    const innerData = [
      { name: 'Tồn kho', value: summary.totalTon, fill: '#10b981' },
      { name: 'Đã xuất', value: summary.totalXuat, fill: '#ef4444' }
    ];
    const COLORS = ['#038539FF', '#3944E0FF', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    // Vòng ngoài: Chi tiết theo loại phôi keo (chỉ hiển thị tồn)
    const outerData = byGlueType.map((item, index) => ({
      name: item.tenPhoiKeo,
      value: item.ton,
      fill: COLORS[index % COLORS.length]
    }));

    return { innerData, outerData };
  }, [inventorySummary]);

  // Dữ liệu cho biểu đồ cột
  const hourlyShiftData = useMemo(() => {
    return shiftData.map(item => ({
      Ca: item.Ca,
      'Khối lượng cân nhập': item.KhoiLuongNhap,
      'Khối lượng cân xuất': item.KhoiLuongXuat
    }));
  }, [shiftData]);

  // Dữ liệu cho biểu đồ xu hướng
  const weighingTrendData = useMemo(() => {
    return trendData.map(item => ({
      name: `Tháng ${item.Thang}`,
      'Tổng nhập (kg)': item.TongKhoiLuongNhap,
      'Tổng xuất (kg)': item.TongKhoiLuongXuat,
    }));
  }, [trendData]);

  const handleSetSelectedYear = (year: string) => {
    setSelectedYear(year);
  };
  
  return {
    // Data
    inventorySummary,
    twoLevelPieData,
    hourlyShiftData,
    weighingTrendData,
    selectedYear,
    setSelectedYear: handleSetSelectedYear,
   
    
    // Date selection
    selectedDate,
    setSelectedDate,
    
    // Refresh functionality
    refreshData,
    isAutoRefresh,
    setIsAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    lastRefresh,
    formatLastRefresh,
  };
}