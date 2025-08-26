// src/components/Notification.tsx

import React, { useState, useEffect } from 'react';

// Định nghĩa props cho component
interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

function Notification({ message, type }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Chỉ chạy animation khi có message mới
    if (message) {
      setIsVisible(true);
      const fadeOutTimer = setTimeout(() => setIsVisible(false), 1000);
      return () => clearTimeout(fadeOutTimer);
    }
  }, [message]);

  if (!message) return null;

  // --- PHẦN GIAO DIỆN (giữ nguyên) ---
  const baseClasses = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-10 rounded-xl text-white font-bold text-center shadow-lg transition-all duration-500 z-50 flex flex-col items-center justify-center min-w-[300px]";
  const animationClass = isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none';
  const bgColor = type === 'success' ? 'bg-[#B4D080]' : 'bg-[#F97316]';
  const icon = type === 'success' 
    ? (
      <svg className="h-16 w-16 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
    : (
      <svg className="h-16 w-16 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );

  return (
    <div className={`${baseClasses} ${bgColor} ${animationClass}`}>
      {icon}
      <span className="text-2xl">{message}</span>
    </div>
  );
}

export default Notification;