// src/hooks/useDashboard.ts

import { useMemo, useState, useCallback, useEffect } from "react";
import { useAutoRefresh } from "./useAutoRefresh";
import apiClient from "../api/apiClient";

// Định nghĩa kiểu dữ liệu từ API /sync/unweighed
interface UnweighedRecord {
  maCode: string;
  ovNO: string;
  package: string;
  mUserID: string;
  qtys: number;
  realQty: number | null;
  mixTime: string | null;
  tenPhoiKeo: string;
  soMay: string;
  memo: string;
  totalTargetQty: number;
  nguoiThaoTac: string;
  soLo: string;
  loai: string;
}

function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useDashboard() {
  const [weighingHistory, setWeighingHistory] = useState<UnweighedRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  // Callback để làm mới dữ liệu
  const dataRefreshCallback = useCallback(async () => {
    try {
      const response = await apiClient.get<UnweighedRecord[]>('/sync/unweighed');
      setWeighingHistory(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu dashboard:", error);
    }
  }, []);

  // Lấy dữ liệu lần đầu
  useEffect(() => {
    dataRefreshCallback();
  }, [dataRefreshCallback]);

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

  // --- LOGIC XỬ LÝ DỮ LIỆU CHO BIỂU ĐỒ ---

  // Dữ liệu cho biểu đồ cột: Tính tổng khối lượng cân theo từng khung giờ
  const hourlyWeighingData = useMemo(() => {
    // Lọc các bản ghi đã cân (loai = 'nhap') theo ngày được chọn
    const dailyData = weighingHistory.filter(item => {
      if (!item.mixTime || item.loai !== 'nhap') return false;
      
      const itemDate = new Date(item.mixTime);
      const selectedDateObj = new Date(selectedDate);
      
      return itemDate.toDateString() === selectedDateObj.toDateString();
    });

    // Nhóm theo giờ
    const hourlyTotals = dailyData.reduce((acc, item) => {
      if (!item.mixTime || !item.realQty) return acc;
      
      const date = new Date(item.mixTime);
      const hour = date.getHours();
      const hourKey = `${String(hour).padStart(2, '0')}:00`;

      acc[hourKey] = (acc[hourKey] || 0) + item.realQty;
      return acc;
    }, {} as Record<string, number>);

    // Tạo dữ liệu cho biểu đồ
    const workHours = Array.from({ length: 11 }, (_, i) => 
      `${String(i + 7).padStart(2, '0')}:00`
    );
    
    return workHours.map(hour => ({
      hour,
      'Tổng khối lượng': hourlyTotals[hour] || 0,
    }));

  }, [weighingHistory, selectedDate]);

  // Dữ liệu cho biểu đồ tròn: Đếm số lần cân của mỗi loại phôi keo
  const glueTypeData = useMemo(() => {
    // Chỉ đếm các bản ghi đã cân nhập
    const cannedRecords = weighingHistory.filter(
      item => item.loai === 'nhap' && item.realQty !== null
    );

    const glueCounts = cannedRecords.reduce((acc, item) => {
      const name = item.tenPhoiKeo || 'Không rõ';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(glueCounts).map(([name, value]) => ({
      name, 
      value
    }));
  }, [weighingHistory]);

  // Xu hướng số lần cân theo thời gian (theo tháng)
  const weighingTrendData = useMemo(() => {
    // Chỉ lấy các bản ghi đã cân nhập
    const cannedRecords = weighingHistory.filter(
      item => item.loai === 'nhap' && item.mixTime && item.realQty !== null
    );

    // Nhóm theo tháng/năm
    const monthlyCounts = cannedRecords.reduce((acc, item) => {
      if (!item.mixTime) return acc;
      
      const date = new Date(item.mixTime);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthYear = `${String(month).padStart(2, '0')}/${year}`;

      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Chuyển đổi và sắp xếp
    return Object.entries(monthlyCounts)
      .map(([date, count]) => ({
        date, 
        "Số lần cân": count
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.date.split('/');
        const [monthB, yearB] = b.date.split('/');
        return new Date(`${yearA}-${monthA}-01`).getTime() - 
               new Date(`${yearB}-${monthB}-01`).getTime();
      });
  }, [weighingHistory]);

  const COLORS = ['#0088FE', '#B93992FF', '#00C49F', '#FFBB28', '#FF8042'];

  return {
    setSelectedDate,
    selectedDate,
    hourlyWeighingData,
    glueTypeData,
    weighingTrendData,
    COLORS,
    
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