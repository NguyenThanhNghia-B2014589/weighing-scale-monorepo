// src/components/ui/SettingsModal/SettingsModal.tsx

import React from 'react';
import { useSettings } from '../../../hooks/useSettings';

// Định nghĩa props mà component này sẽ nhận từ cha
interface SettingsModalProps {
  isAutoRefresh: boolean;
  setIsAutoRefresh: (enabled: boolean) => void;
  refreshData: () => void;
  formatLastRefresh: () => string;
  dateRange: string;
  setDateRange: (days: string) => void;
}

// Component nhận props
function SettingsModal({
  refreshData,
  isAutoRefresh, 
  setIsAutoRefresh, 
  dateRange, 
  setDateRange,
}: SettingsModalProps) {
  const { showSettingsModal, closeSettingsModal } = useSettings();

  if (!showSettingsModal) return null;
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeSettingsModal}
      ></div>
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-90vh overflow-y-auto">
          {/* Header Modal */}
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Cài đặt
            </h3>
            <button
              onClick={closeSettingsModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nội dung Modal */}
          <div className="p-6 space-y-6">

            {/* Thêm các cài đặt khác trong tương lai */}
            <div className=" ">
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-2">
                Phạm vi lịch sử
              </label>
              <select
                id="date-range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="7">7 ngày qua</option>
                <option value="15">15 ngày qua</option>
                <option value="30">30 ngày qua</option>
                <option value="90">90 ngày qua</option>
                <option value="all">Tất cả lịch sử</option>
                <option value="1">Test</option>
              </select>
            </div>

            {/* --- 3. (Tùy chọn) THÊM TOGGLE TỰ ĐỘNG LÀM MỚI --- */}
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Tự động làm mới</h4>
                <p className="text-sm text-gray-500">Tự động tải lại dữ liệu sau mỗi 5 phút.</p>
              </div>
              {/* (Bạn cần tạo component ToggleSwitch hoặc dùng checkbox) */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAutoRefresh}
                  onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>

          {/* Footer Modal */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={closeSettingsModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                closeSettingsModal();
                refreshData(); // Làm mới ngay khi lưu cài đặt
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lưu & Làm mới
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsModal;