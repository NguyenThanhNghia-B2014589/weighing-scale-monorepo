// src/components/ui/SettingsModal/SettingsModal.tsx

import React from 'react';
import { useSettings } from '../../../hooks/useSettings';

// Định nghĩa props mà component này sẽ nhận từ cha
interface SettingsModalProps {
  isAutoRefresh: boolean;
  setIsAutoRefresh: (enabled: boolean) => void;
  refreshData: () => void;
  formatLastRefresh: () => string;
}

// Component nhận props
function SettingsModal({
  refreshData,
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
              <h4 className="text-sm font-medium text-gray-700 mb-3">Cài đặt khác</h4>
              <div className="text-sm text-gray-500">
                Các tùy chọn cài đặt khác sẽ được thêm vào đây...
              </div>
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