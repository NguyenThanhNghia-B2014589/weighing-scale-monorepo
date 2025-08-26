// src/components/useNotification.ts

import { useState, useEffect } from 'react';

type NotificationType = 'success' | 'error';

// Custom hook này sẽ quản lý state và logic của thông báo
export function useNotification(duration: number = 1000) {
  // State để lưu trữ thông tin của thông báo
  const [notification, setNotification] = useState<{ message: string; type: NotificationType }>({
    message: '',
    type: 'success',
  });

  // useEffect để tự động xóa thông báo sau một khoảng thời gian
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: 'success' }); // Reset lại
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification, duration]);

  // Hàm để kích hoạt thông báo
  const showNotification = (message: string, type: NotificationType = 'success') => {
    setNotification({ message, type });
  };

  // Trả về thông tin cần thiết cho component UI
  return {
    notificationMessage: notification.message,
    notificationType: notification.type,
    showNotification,
  };
}