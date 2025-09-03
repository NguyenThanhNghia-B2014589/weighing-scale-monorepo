// src/components/ui/Notification/useNotification.ts

import { useState, useEffect } from 'react';

type NotificationType = 'success' | 'error';

// Hook đã được đơn giản hóa
export function useNotification(duration: number = 1500) { // Thời gian hiển thị thông báo
  const [notification, setNotification] = useState({ message: '', type: 'success' as NotificationType });

  // useEffect này chỉ dùng để xóa message
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: 'success' });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification.message, duration]); // Chỉ phụ thuộc vào message

  const showNotification = (message: string, type: NotificationType = 'success') => {
    setNotification({ message, type });
  };

  return {
    notificationMessage: notification.message,
    notificationType: notification.type,
    showNotification,
  };
}