import { useState, useMemo } from 'react';
import { useNotification } from './useNotification';
import { mockApiData, WeighingData } from '../data/weighingData';
import { useAuth } from './useAuth';

// --- ĐỊNH NGHĨA CUSTOM HOOK ---
export function useWeighingStation() {
  // --- STATE ---
  const [standardWeight, setStandardWeight] = useState(0.0);
  const [deviationPercent] = useState(3);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [tableData, setTableData] = useState<WeighingData | null>(null);
  const { showNotification, notificationMessage, notificationType } = useNotification();
  const [mixingTime, setMixingTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const { user } = useAuth();


    // Chuẩn bị dữ liệu cho bảng
  const tableHeaders = ["Tên Phôi Keo", "Số Lô", "Số Máy", "Khối Lượng Mẻ (g)", "Người Thao Tác", "Thời Gian Cân"];
  const tableValues = tableData
    ? [
        tableData.name,
        tableData.solo,
        tableData.somay,
        tableData.weight.toFixed(1),
        user?.userName || '',
        // Sử dụng mixingTime nếu nó tồn tại, nếu không, hiển thị '---'
        mixingTime || '---' 
      ]
    : Array(tableHeaders.length).fill('');
    
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
      const foundData = Object.values(mockApiData).find(
        (product) => product.code === scannedCode
      );
      if (foundData) {
        setTableData(foundData);
        setStandardWeight(foundData.weight);
        setMixingTime(null);
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
    setIsSubmit(true); // 2. Bật loading
    setTimeout(() => {
      if (isWeightValid && tableData) {

        const now = new Date();
        const formattedDateTime = now.toLocaleString('vi-VN', {
          day: '2-digit',   
          month: '2-digit',  
          year: 'numeric',   
          hour: '2-digit',   
          minute: '2-digit', 
          hour12: false
        });
        setMixingTime(formattedDateTime); // Cập nhật state, bảng sẽ tự re-render với thời gian mới

        showNotification('Lưu thành công!', 'success');
        
        // Reset form sau một khoảng trễ để người dùng kịp thấy kết quả
        setStandardWeight(0);
        setTimeout(() => {
          setCurrentWeight(null);
          setScannedCode('');
          setTableData(null);
          
          setMixingTime(null);
        }, 3000);
      } else {
        showNotification('Trọng lượng không hợp lệ!', 'error');
      }
      setIsSubmit(false); // 3. Tắt loading
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
    isLoading,
    isSubmit,
    mixingTime,
    currentUser: user,
    tableHeaders,
    tableValues,
    handleCodeChange,
    handleCurrentWeightChange,
    handleScan,
    handleSubmit,
  };
}