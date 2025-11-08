// apps/frontend/src/hooks/useUnweighedPage.ts
import { useState, useCallback, useEffect } from "react";
import { useAutoRefresh } from "./useAutoRefresh";
import apiClient from "../api/apiClient";
//import { useSettings } from "./useSettings"; // Dùng chung context

// 1. Định nghĩa kiểu dữ liệu trả về từ API mới
export interface UnweighedSummary {
 ovNO: string;
 memo: string | null;
 totalTargetQty: number;
  totalPackages: number;
 chuaCanNhap: number;
 chuaCanXuat: number;
}

export function useUnweighedPage() {
 // Lấy state cài đặt chung
  //const { isAutoRefresh, setIsAutoRefresh } = useSettings();

  // State của trang
 const [data, setData] = useState<UnweighedSummary[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 // 2. Logic fetch
 const fetchData = useCallback(async () => {
  setIsLoading(true);
  try {
   const response = await apiClient.get<UnweighedSummary[]>('/unweighed/summary');
   setData(response.data);
  } catch (error) {
   console.error("Lỗi khi lấy dữ liệu chưa cân:", error);
   setData([]);
  } finally {
   setIsLoading(false);
  }
 }, []);

 // 3. Lấy dữ liệu lần đầu
 useEffect(() => {
  fetchData();
 }, [fetchData]);

 // 4. Tự động làm mới
 const { 
  lastRefresh, 
  formatLastRefresh,
  refreshData,
 } = useAutoRefresh(fetchData, { 
    //isAutoRefresh,
    //setIsAutoRefresh 
  });

 return {
  data,
  isLoading,
  refreshData,
  lastRefresh,
  formatLastRefresh
 };
}