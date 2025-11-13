// apps/frontend/src/hooks/useWeighingStation.ts
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNotification } from './useNotification';
import apiClient from '../api/apiClient';
import { useAuth } from './useAuth';
import { AxiosError } from 'axios';
import { scaleService, ScaleData } from '../services/scaleService';

interface ScannedData {
  maCode: string;
  ovNO: string;
  package: number;
  mUserID: string;
  qtys: number;
  tenPhoiKeo: string;
  soMay: string;
  nguoiThaoTac: string;
  soLo: number;
  memo: string | null;
  totalTargetQty: number;
  totalNhapWeighed: number;
  totalXuatWeighed: number;
  x_WeighedNhap: number;
  y_TotalPackages: number;
  isNhapWeighed: boolean;
  isXuatWeighed: boolean;
}

interface CompleteResponseData {
  message: string;
  summaryData: {
    totalTargetQty: number;
    totalNhapWeighed: number;
    totalXuatWeighed: number;
    memo: string | null;
  };
}

function getLocalTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function useWeighingStation() {
  const [standardWeight, setStandardWeight] = useState(0.0);
  const [deviationPercent, setDeviationPercent] = useState(() => {
    return Number(localStorage.getItem('weighingDeviationPercent')) || 1;
  });
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [tableData, setTableData] = useState<ScannedData | null>(null);
  const { showNotification, notificationMessage, notificationType } = useNotification();
  const [mixingTime, setMixingTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const { user } = useAuth();
  const isUiDisabled = !!notificationMessage;
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [weighingType, setWeighingType] = useState<'nhap' | 'xuat' | null>(null);

  // STATE CHO CÂN
  const [scaleConnected, setScaleConnected] = useState(false);
  const [scaleEnabled, setScaleEnabled] = useState(() => {
    return localStorage.getItem('scaleEnabled') === 'true';
  });

  const handleDeviationChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPercent = Number(event.target.value);
    setDeviationPercent(newPercent);
    localStorage.setItem('weighingDeviationPercent', String(newPercent));
  }, []);

  // HÀM KẾT NỐI CÂN
  useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
   if (e.key === 'scaleEnabled') {
    console.log('Phát hiện thay đổi scaleEnabled từ localStorage');
    setScaleEnabled(e.newValue === 'true');
   }
  };
  window.addEventListener('storage', handleStorageChange);
  return () => {
   window.removeEventListener('storage', handleStorageChange);
  };
 }, []);


 // *** 2. SỬA LẠI LOGIC LẮNG NGHE CÂN ***
 useEffect(() => {
  // LUÔN LUÔN lắng nghe trạng thái kết nối
  const unsubscribeStatus = scaleService.onConnectionStatus((connected) => {
   console.log('📶 Trạng thái cân thay đổi:', connected);
   setScaleConnected(connected); 
   if (!connected) {
    console.log('❌ Cân đã ngắt kết nối');
        // Tự động tắt 'enabled' nếu mất kết nối
    setScaleEnabled(false);
    localStorage.setItem('scaleEnabled', 'false');
   }
  });

  // LUÔN LUÔN lắng nghe dữ liệu từ cân, nhưng chỉ process khi scaleEnabled = true
  const unsubscribeData = scaleService.onScaleData((data: ScaleData) => {
   // Chỉ process nếu scale được enable
   if (!scaleEnabled) return;
   
   if (!data) return;

   if (data.status === 'ST') {
    let weight = data.value;
    if (data.unit.toLowerCase() === 'g') {
     weight = weight / 1000;
    }
    weight = Math.round(weight * 1000) / 1000;
    setCurrentWeight(weight);
   }
  });

  // Cleanup cả hai listeners
  return () => {
   console.log('🧹 Hủy lắng nghe (status và data)');
   unsubscribeStatus();
   unsubscribeData();
  };
 }, [scaleEnabled]); // Depend on scaleEnabled để re-setup khi nó thay đổi

  // useEffect để tắt skeleton
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const deviationPct = useMemo(() => {
    if (standardWeight === 0 || currentWeight === null) return 0;
    return +(((currentWeight - standardWeight) / standardWeight) * 100).toFixed(3);
  }, [currentWeight, standardWeight]);

  const tableHeaders = ["Tên Phôi Keo", "Số Lô", "Số Máy", "Khối Lượng Mẻ (kg)", "Khối Lượng Đã Cân (kg)", "Người Thao Tác", "Thời Gian Cân"];
  const tableValues = tableData
    ? [
      tableData.tenPhoiKeo,
      tableData.soLo,
      tableData.soMay,
      tableData.qtys.toFixed(3),
      mixingTime ? (currentWeight ?? 0).toFixed(3) : '---',
      tableData.nguoiThaoTac,
      mixingTime || (tableData.isNhapWeighed ? 'Đã cân nhập' : '---')
    ]
    : Array(tableHeaders.length).fill('');
  
  const { minWeight, maxWeight } = useMemo(() => {
    const deviationAmount = standardWeight * (deviationPercent / 100);
    const min = standardWeight - deviationAmount;
    const max = standardWeight + deviationAmount;
    return { minWeight: min, maxWeight: max };
  }, [standardWeight, deviationPercent]);
 
  const isWeightValid = useMemo(() => {
    if (currentWeight === null || !tableData) return false;
    return currentWeight >= minWeight && currentWeight <= maxWeight;
  }, [currentWeight, minWeight, maxWeight, tableData]);

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScannedCode(event.target.value);
  };

  const handleCurrentWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCurrentWeight(value === '' ? null : parseFloat(value));
  };

  const handleScan = async () => {
    if (!scannedCode) {
      showNotification('Vui lòng nhập Mã Code', 'error');
      return;
    }
    setIsLoading(true);
    setTableData(null);
    setStandardWeight(0);
    setMixingTime(null);
    setWeighingType(null);
    setCurrentWeight(null);

    try {
      const response = await apiClient.get<ScannedData>(`/scan/${scannedCode}`);
      const data = response.data;

      if (data.isNhapWeighed && data.isXuatWeighed) {
        setTableData(data);
        setStandardWeight(data.qtys);
        showNotification('Mã này đã hoàn thành (đã cân nhập và xuất).', 'error');
        setWeighingType(null);
        setCurrentWeight(null);
      } else if (data.isNhapWeighed && !data.isXuatWeighed) {
        setTableData(data);
        setStandardWeight(data.qtys);
        setWeighingType('xuat');
        showNotification('Quét thành công. Sẵn sàng CÂN XUẤT.', 'success');
      } else {
        setTableData(data);
        setStandardWeight(data.qtys);
        setWeighingType('nhap');
        showNotification('Quét thành công. Sẵn sàng CÂN NHẬP.', 'success');
      }

    } catch (error) {
      setTableData(null);
      setStandardWeight(0);
      if (error instanceof AxiosError && error.response) {
        showNotification(error.response.data.message || 'Lỗi không xác định từ máy chủ', 'error');
      } else if (error instanceof Error) {
        showNotification(error.message, 'error');
      } else {
        showNotification('Lỗi kết nối máy chủ khi quét mã.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isWeightValid || !tableData || !weighingType || currentWeight === null) {
      showNotification('Dữ liệu không hợp lệ để lưu.', 'error');
      return;
    }

    setIsSubmit(true);
    const localTimestamp = getLocalTimestamp();
    
    const weighData = {
      maCode: scannedCode,
      khoiLuongCan: currentWeight,
      thoiGianCan: localTimestamp,
      loai: weighingType
    };

    try {
      const response = await apiClient.post<CompleteResponseData>('/complete', weighData);
        
      const formattedDateTime = new Date(localTimestamp).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', hour12: false
      });
      setMixingTime(formattedDateTime);

      showNotification(`Lưu ${weighingType} thành công!`, 'success');
          
      const newSummary = response.data.summaryData;
      setTableData(prevData => ({
        ...prevData!,
        totalTargetQty: newSummary.totalTargetQty,
        totalNhapWeighed: newSummary.totalNhapWeighed,
        totalXuatWeighed: newSummary.totalXuatWeighed,
        memo: newSummary.memo,
        isNhapWeighed: weighingType === 'nhap' ? true : prevData!.isNhapWeighed,
        isXuatWeighed: weighingType === 'xuat' ? true : prevData!.isXuatWeighed,
      }));
      setWeighingType(null);

      setTimeout(() => {
        setScannedCode('');
      }, 3000);

    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        showNotification(error.response.data.message || 'Lỗi không xác định từ máy chủ', 'error');
      } else if (error instanceof Error) {
        showNotification(error.message, 'error');
      } else {
        showNotification('Lỗi kết nối máy chủ khi lưu.', 'error');
      }
    } finally {
      setIsSubmit(false);
    }
  };
 
  return {
    standardWeight,
    deviationPercent,
    currentWeight,
    deviationPct,
    scannedCode,
    tableData,
    minWeight,
    maxWeight,
    isWeightValid,
    notificationMessage,
    notificationType,
    isLoading,
    isSubmit,
    isPageLoading,
    isUiDisabled,
    mixingTime,
    currentUser: user,
    tableHeaders,
    tableValues,
    weighingType,
    scaleConnected,
    scaleEnabled,
    //handleConnectScale,
    //handleDisconnectScale,
    handleCodeChange,
    handleCurrentWeightChange,
    handleScan,
    handleSubmit,
    handleDeviationChange,
  };
}