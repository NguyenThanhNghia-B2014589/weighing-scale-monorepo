// src/hooks/useWeighingStation.ts
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNotification } from './useNotification';
// import { mockApiData, WeighingData } from '../data/weighingData'; // <-- Xóa mock data
import apiClient from '../api/apiClient'; // <-- 1. Import API client
import { useAuth } from './useAuth';
import { AxiosError } from 'axios';

// 2. Định nghĩa interface cho dữ liệu API trả về
// (Dựa trên file scanController.ts của bạn)
interface ScannedData {
  maCode: string;
  ovNO: string;
  package: number;
  mUserID: string;
  qtys: number; // Đây là khối lượng mẻ (standardWeight)
  tenPhoiKeo: string;
  soMay: string;
  nguoiThaoTac: string;
  soLo: number;
  memo: string | null;
  // Dữ liệu tổng hợp
  totalTargetQty: number;
  totalNhapWeighed: number;
  totalXuatWeighed: number;
  x_WeighedNhap: number;
  y_TotalPackages: number;
  // Trạng thái của mã này
  isNhapWeighed: boolean;
  isXuatWeighed: boolean;
}

// Dữ liệu API /complete trả về
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
  // getMonth() (0-11) nên cần +1
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// --- ĐỊNH NGHĨA CUSTOM HOOK ---
export function useWeighingStation() {
  // --- STATE ---
  const [standardWeight, setStandardWeight] = useState(0.0);
  const [deviationPercent, setDeviationPercent] = useState(() => {
    return Number(localStorage.getItem('weighingDeviationPercent')) || 1;
    });
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  // 3. tableData giờ sẽ là ScannedData
  const [tableData, setTableData] = useState<ScannedData | null>(null);
  const { showNotification, notificationMessage, notificationType } = useNotification();
  const [mixingTime, setMixingTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Dùng cho 'Scan'
  const [isSubmit, setIsSubmit] = useState(false); // Dùng cho 'Hoàn tất'
  const { user } = useAuth();
  const isUiDisabled = !!notificationMessage;
  const [isPageLoading, setIsPageLoading] = useState(true); // Giữ nguyên skeleton

  // THÊM HÀM MỚI ĐỂ XỬ LÝ DROPDOWN
  const handleDeviationChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPercent = Number(event.target.value);
    setDeviationPercent(newPercent);
    localStorage.setItem('weighingDeviationPercent', String(newPercent));
  }, []);
 
  // STATE MỚI: Quyết định là cân nhập hay xuất
  const [weighingType, setWeighingType] = useState<'nhap' | 'xuat' | null>(null);

  // useEffect để tắt skeleton (Giữ nguyên)
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- GIÁ TRỊ PHÁI SINH (Giữ nguyên) ---
  const deviationPct = useMemo(() => {
      // *** THÊM LẠI LOGIC TÍNH TOÁN ***
    if (standardWeight === 0 || currentWeight === null) return 0;
    return +(((currentWeight - standardWeight) / standardWeight) * 100).toFixed(3);
  }, [currentWeight, standardWeight]);

  // Chuẩn bị dữ liệu cho bảng
  const tableHeaders = ["Tên Phôi Keo", "Số Lô", "Số Máy", "Khối Lượng Mẻ (kg)", "Khối Lượng Đã Cân (kg)", "Người Thao Tác", "Thời Gian Cân"];
  const tableValues = tableData
    ? [
      tableData.tenPhoiKeo,
      tableData.soLo,
      tableData.soMay,
      tableData.qtys.toFixed(3), // Khối lượng mẻ (standard)
      mixingTime ? (currentWeight ?? 0).toFixed(3) : '---',
      tableData.nguoiThaoTac, // Lấy từ API
      mixingTime || (tableData.isNhapWeighed ? 'Đã cân nhập' : '---') // Hiển thị trạng thái
    ]
    : Array(tableHeaders.length).fill('');
  
  // Logic tính toán MIN/MAX (Giữ nguyên)
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

  // --- HÀM XỬ LÝ SỰ KIỆN (ĐÃ CẬP NHẬT) ---

  // Xử lý thay đổi mã quét (Giữ nguyên)
  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScannedCode(event.target.value);
  };
  // Xử lý thay đổi trọng lượng (Giữ nguyên)
  const handleCurrentWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCurrentWeight(value === '' ? null : parseFloat(value));
  };

  // 5. CẬP NHẬT handleScan
  const handleScan = async () => {
    if (!scannedCode) {
      showNotification('Vui lòng nhập Mã Code', 'error');
      return;
    }
    setIsLoading(true);
    setTableData(null); // Xóa dữ liệu cũ
    setStandardWeight(0);
    setMixingTime(null);
    setWeighingType(null);
    setCurrentWeight(null);
    try {
      const response = await apiClient.get<ScannedData>(`/scan/${scannedCode}`);
      const data = response.data;

      // Kiểm tra trạng thái cân
      if (data.isNhapWeighed && data.isXuatWeighed) {
        // 1. Đã hoàn thành (Nhập và Xuất)
        setTableData(data); // Vẫn hiển thị data
        setStandardWeight(data.qtys);
        showNotification('Mã này đã hoàn thành (đã cân nhập và xuất).', 'error');
        setWeighingType(null); // Không làm gì cả
        setCurrentWeight(null);
      } else if (data.isNhapWeighed && !data.isXuatWeighed) {
        // 2. Đã Nhập, chờ Xuất
        setTableData(data);
        setStandardWeight(data.qtys);
        setWeighingType('xuat'); // <-- Sẵn sàng để xuất
        showNotification('Quét thành công. Sẵn sàng CÂN XUẤT.', 'success');
      } else {
        // 3. Chưa Nhập (trường hợp !data.isNhapWeighed)
        setTableData(data);
        setStandardWeight(data.qtys);
        setWeighingType('nhap'); // <-- Sẵn sàng để nhập
        showNotification('Quét thành công. Sẵn sàng CÂN NHẬP.', 'success');
      }

    } catch (error) {
      setTableData(null);
      setStandardWeight(0);
      if (error instanceof AxiosError && error.response) {
        // Lỗi này từ backend (404, 400, ...)
        showNotification(error.response.data.message || 'Lỗi không xác định từ máy chủ', 'error');
      } else if (error instanceof Error) {
        // Lỗi mạng hoặc lỗi code
        showNotification(error.message, 'error');
      } else {
        // Lỗi lạ
        showNotification('Lỗi kết nối máy chủ khi quét mã.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 6. CẬP NHẬT handleSubmit
  const handleSubmit = async () => {
    // Kiểm tra các điều kiện
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
      // Gọi API /complete
      const response = await apiClient.post<CompleteResponseData>('/complete', weighData);
        
      // Lấy thời gian hiện tại để hiển thị
      const formattedDateTime = new Date(localTimestamp).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', hour12: false
      });
      setMixingTime(formattedDateTime);

      showNotification(`Lưu ${weighingType} thành công!`, 'success');
          
      // Cập nhật dữ liệu tóm tắt trên UI ngay lập tức
      const newSummary = response.data.summaryData;
      setTableData(prevData => ({
        ...prevData!,
        totalTargetQty: newSummary.totalTargetQty,
        totalNhapWeighed: newSummary.totalNhapWeighed,
        totalXuatWeighed: newSummary.totalXuatWeighed,
        memo: newSummary.memo,
        // Cập nhật trạng thái 'vừa cân'
        isNhapWeighed: weighingType === 'nhap' ? true : prevData!.isNhapWeighed,
        isXuatWeighed: weighingType === 'xuat' ? true : prevData!.isXuatWeighed,
      }));
      setWeighingType(null); // Vô hiệu hóa nút Submit

      // Reset form sau 3 giây (như logic cũ)
      setTimeout(() => {
        //setTableData(null);
        //setStandardWeight(0);
        //setCurrentWeight(null);
        setScannedCode('');
        //setMixingTime(null);
      }, 3000);

    } catch (error) {
      // Hiển thị lỗi từ backend
      if (error instanceof AxiosError && error.response) {
        // Lỗi này từ backend (402, 403, 406...)
        showNotification(error.response.data.message || 'Lỗi không xác định từ máy chủ', 'error');
      } else if (error instanceof Error) {
        // Lỗi mạng hoặc lỗi code
        showNotification(error.message, 'error');
      } else {
        showNotification('Lỗi kết nối máy chủ khi lưu.', 'error');
      }
    } finally {
      setIsSubmit(false);
    }
  };
 
  // --- TRẢ VỀ CÁC GIÁ TRỊ VÀ HÀM ---
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
      weighingType, // <-- 7. Trả về state mới
    handleCodeChange,
    handleCurrentWeightChange,
    handleScan,
    handleSubmit,
    handleDeviationChange,
  };
}