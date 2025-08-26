import { useState, useMemo } from 'react';
import { useNotification } from '../ui/Notification/useNotification';

// --- DỮ LIỆU GIẢ LẬP VÀ TYPES ---
const mockApiData = {
  "123": { code: "123", name: "Phôi keo A", solo: "Lô 1", somay: "Máy 1", weight: 55.0, user: "Nguyễn Văn A", time: "12:00 01/01/2025" },
  "456": { code: "456", name: "Phôi keo B", solo: "Lô 2", somay: "Máy 3", weight: 62.5, user: "Trần Thị B", time: "14:30 02/01/2025" }
};

// Định nghĩa kiểu dữ liệu cho thông tin cân
type WeighingData = {
  code: string; name: string; solo: string; somay: string; weight: number; user: string; time: string;
};

// --- ĐỊNH NGHĨA CUSTOM HOOK ---
export function useWeighingStation() {
  // --- STATE ---
  const [standardWeight, setStandardWeight] = useState(0.0);
  const [deviationPercent, setDeviationPercent] = useState(3);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [tableData, setTableData] = useState<WeighingData | null>(null);
  const { showNotification, notificationMessage, notificationType } = useNotification();
  
  // 1. Thêm state isLoading
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIC TÍNH TOÁN (useMemo) ---
  // Tính toán trọng lượng tối thiểu và tối đa dựa trên độ lệch
  const { minWeight, maxWeight } = useMemo(() => {
    const deviationAmount = standardWeight * (deviationPercent / 100);
    const min = standardWeight - deviationAmount;
    const max = standardWeight + deviationAmount;
    return { minWeight: min, maxWeight: max };
  }, [standardWeight, deviationPercent]);
  // Kiểm tra xem trọng lượng hiện tại có hợp lệ không
  const isWeightValid = useMemo(() => {
    if (currentWeight === null || !tableData) return false;
    return currentWeight >= minWeight && currentWeight <= maxWeight;
  }, [currentWeight, minWeight, maxWeight, tableData]);

  // --- HÀM XỬ LÝ SỰ KIỆN ---
  // Xử lý thay đổi mã quét
  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScannedCode(event.target.value);
  };
  // Xử lý thay đổi trọng lượng hiện tại
  const handleCurrentWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCurrentWeight(value === '' ? null : parseFloat(value));
  };
  // Xử lý sự kiện quét mã
  const handleScan = () => {
    setIsLoading(true); // 2. Bật loading
    setTimeout(() => {
      const foundData = mockApiData[scannedCode as keyof typeof mockApiData];
      if (foundData) {
        setTableData(foundData);
        setStandardWeight(foundData.weight);
        showNotification('Quét mã thành công!', 'success');
      } else {
        setTableData(null);
        setStandardWeight(0);
        showNotification('Mã không hợp lệ!', 'error');
      }
      setIsLoading(false); // 3. Tắt loading
    }, 500);
  };
  // Xử lý sự kiện lưu dữ liệu
  const handleSubmit = () => {
    setIsLoading(true); // 2. Bật loading
    setTimeout(() => {
      if (isWeightValid && tableData) {
        showNotification('Lưu thành công!', 'success');
        setCurrentWeight(null);
        setScannedCode('');
        setTableData(null);
        setStandardWeight(0);
      } else {
        showNotification('Trọng lượng không hợp lệ!', 'error');
      }
      setIsLoading(false); // 3. Tắt loading
    }, 1000);
  };
  
  // --- TRẢ VỀ CÁC GIÁ TRỊ VÀ HÀM ---
  return {
    standardWeight,
    deviationPercent,
    currentWeight,
    scannedCode,
    tableData,
    minWeight,
    maxWeight,
    isWeightValid,
    notificationMessage,
    notificationType,
    isLoading, // 4. Trả về isLoading
    handleCodeChange,
    handleCurrentWeightChange,
    handleScan,
    handleSubmit,
  };
}