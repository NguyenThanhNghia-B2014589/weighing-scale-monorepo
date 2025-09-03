import React, { useEffect, useState } from 'react';
import { useWeighingStation } from '../../hooks/useWeighingStation';
import Notification from '../ui/Notification/Notification';
import Spinner from '../ui/Spinner/Spinner';
import DashboardSkeleton from './DashboardSkeleton';

function WeighingStation() {

  const [isPageLoading, setIsPageLoading] = useState(true);
  // --- GỌI CUSTOM HOOK ĐỂ LẤY TOÀN BỘ LOGIC VÀ STATE ---
  const {
    standardWeight,
    deviationPercent,
    currentWeight,
    scannedCode,
    tableData,
    notificationMessage,
    notificationType,
    minWeight,
    maxWeight,
    isWeightValid,
    isLoading,
    isSubmit,
    mixingTime,
    currentUser,
    handleCodeChange,
    handleCurrentWeightChange,
    handleScan,
    handleSubmit
  } = useWeighingStation();

  // --- BIẾN PHÁI SINH CHO UI ---

   //Thêm useEffect để tắt skeleton sau 1 giây 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000); // 1000ms = 1 giây

    // Dọn dẹp timer khi component bị hủy
    return () => clearTimeout(timer);
  }, []); // Mảng rỗng `[]` đảm bảo hiệu ứng này chỉ chạy 1 lần khi component được render lần đầu

  // HIỂN THỊ SKELETON NẾU isPageLoading LÀ TRUE
  if (isPageLoading) {
    return <DashboardSkeleton />;
  } 


  // Giao diện bị khóa khi và chỉ khi có một thông báo đang hiển thị
  const isUiDisabled = !!notificationMessage;

  // Xác định màu sắc cho ô input trọng lượng
  const weightColorClass = currentWeight !== null && tableData
    ? (isWeightValid ? 'text-green-400' : 'text-red-400')
    : 'text-yellow-400';

  // Chuẩn bị dữ liệu cho bảng
  const tableHeaders = ["Tên Phôi Keo", "Số Lô", "Số Máy", "Khối Lượng Mẻ (g)", "Người Thao Tác", "Thời Gian Cân"];
  const tableValues = tableData
    ? [
        tableData.name,
        tableData.solo,
        tableData.somay,
        tableData.weight.toFixed(1),
        currentUser?.userName || '',
        // Sử dụng mixingTime nếu nó tồn tại, nếu không, hiển thị '---'
        mixingTime || '---' 
      ]
    : Array(tableHeaders.length).fill('');

  // --- PHẦN GIAO DIỆN (JSX) ---
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto relative">
      <Notification 
        message={notificationMessage}
        type={notificationType}
      />
      
      {/* Lớp phủ màu đen và logic vô hiệu hóa UI */}
      {isUiDisabled && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40"></div>
      )}
      
      <div className={isUiDisabled ? 'pointer-events-none opacity-50' : ''}>
        
        {/* --- KHU VỰC HIỂN THỊ TRỌNG LƯỢỢNG --- */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div className="space-y-3 w-full">
            <h1 className="text-3xl md:text-4xl font-bold flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-yellow-500">Trọng lượng:</span>
              <span>
                <input
                  type='number' 
                  className={`bg-gray-500 font-mono px-4 py-1 rounded w-5/6 sm:w-48 text-left sm:text-center ${weightColorClass}`}
                  placeholder="0.0"
                  value={currentWeight === null ? '' : currentWeight}
                  step="0.1"
                  onChange={handleCurrentWeightChange}
                />
                <span className="text-3xl ml-2 text-gray-700">g</span>
              </span>    
            </h1>

            <div className="flex flex-col md:flex-row text-base md:text-lg font-bold text-black">
              <div className="md:w-1/2">
                <span>Trọng lượng tiêu chuẩn:
                  <span className="pl-3 text-2xl md:text-3xl text-green-600 font-bold mt-1">{standardWeight.toFixed(1)}</span>
                </span>
              </div>
              <div className="md:w-1/2 mt-2 md:mt-0">
                <span>Chênh lệch tối đa:
                  <span className="pl-3 text-2xl md:text-3xl text-green-600 font-bold mt-1">{deviationPercent}%</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row text-base md:text-lg font-bold text-black">
              <div className="md:w-1/2">
                <span>MIN:
                  <span className="pl-3 text-2xl md:text-3xl text-black font-bold mt-1">{minWeight.toFixed(1)}</span>
                </span>
              </div>
              <div className="md:w-1/2 mt-2 md:mt-0">
                <span>MAX:
                  <span className="pl-3 text-2xl md:text-3xl text-black font-bold mt-1">{maxWeight.toFixed(1)}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <button 
              className="bg-[#00446e] text-white font-bold w-full md:w-auto px-8 py-3 rounded-lg shadow-md hover:bg-[#003a60] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={!isWeightValid || !tableData || isSubmit}
            >
              {isSubmit ? 'Đang lưu...' : 'Hoàn tất'}
            </button>
          </div>
        </div>

        {/* --- BẢNG THÔNG TIN --- */}
        <div className="mb-8">
          <div className="hidden md:grid grid-cols-6 border-t border-r border-gray-300">
            {tableHeaders.map((header) => ( <div key={header} className="bg-sky-400 text-black font-semibold text-center p-3 border-b border-l border-gray-300">{header}</div> ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 border-r border-b border-gray-300 md:border-t-0">
            {tableValues.map((value, index) => (
              <div key={index} className="bg-gray-100 p-3 md:h-20 border-t border-l border-gray-300 md:border-t-0 flex items-center justify-start md:justify-center font-medium text-gray-800">
                <span className="font-bold md:hidden mr-2">{tableHeaders[index]}: </span>
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* --- KHU VỰC QUÉT MÃ --- */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            className="w-full md:flex-grow border-2 border-green-500 rounded-md p-4 text-center text-2xl font-mono bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            placeholder="CODE HERE"
            value={scannedCode}
            onChange={handleCodeChange}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <button
            onClick={handleScan}
            className="bg-green-600 text-white font-bold w-full md:w-auto px-12 py-4 rounded-md text-xl hover:bg-green-700 transition-colors disabled:bg-green-600 disabled:cursor-wait flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="md" /> : 'Scan'}
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default WeighingStation;