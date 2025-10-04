// src/hooks/useAutoRefresh.ts

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoRefreshOptions {
  defaultInterval?: number; // Khoảng thời gian làm mới mặc định (giây)
  autoStart?: boolean; // Có tự động bắt đầu không
}

interface UseAutoRefreshReturn {
  // State
  isAutoRefresh: boolean;
  refreshInterval: number;
  lastRefresh: Date;
  
  // Actions
  refreshData: () => void;
  setIsAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (seconds: number) => void;
  
  // Utility
  formatLastRefresh: (date?: Date) => string;
}

export function useAutoRefresh(
  dataRefreshCallback: () => void,
  options: UseAutoRefreshOptions = {}
): UseAutoRefreshReturn {
  const {
    defaultInterval = 300, // 5 phút mặc định
    autoStart = true
  } = options;

  // State cho việc làm mới
  const [isAutoRefresh, setIsAutoRefresh] = useState(autoStart);
  const [refreshInterval, setRefreshInterval] = useState(defaultInterval);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // ref lưu phiên bản mới nhất của callback (tránh stale closures)
  const savedCallback = useRef<() => void>(() => {});
  useEffect(() => {
    savedCallback.current = dataRefreshCallback;
  }, [dataRefreshCallback]);

  // refreshData sẽ luôn gọi savedCallback.current() (phiên bản mới nhất)
  const refreshData = useCallback(() => {
    // gọi callback mới nhất
    savedCallback.current();
    setLastRefresh(new Date());
  }, []);

  // Hàm format thời gian hiển thị
  const formatLastRefresh = useCallback((date: Date = lastRefresh) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [lastRefresh]);

  // Auto refresh effect
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      // Gọi refreshData (nó sẽ dùng savedCallback.current())
      refreshData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, refreshData]);

  return {
    // State
    isAutoRefresh,
    refreshInterval,
    lastRefresh,
    
    // Actions
    refreshData,
    setIsAutoRefresh,
    setRefreshInterval,
    
    // Utility
    formatLastRefresh,
  };
}