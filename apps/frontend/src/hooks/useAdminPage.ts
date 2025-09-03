// src/hooks/useAdminPage.ts
import { useState, useEffect, useMemo } from "react";
import { mockApiData } from "../data/weighingData";
import { useMediaQuery } from "react-responsive";
import { CellMeasurerCache } from 'react-virtualized';

export function useAdminPageLogic() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [debouncedTerm, setDebouncedTerm] = useState("");
  
  const cache = new CellMeasurerCache({
    fixedWidth: true, // Chiều rộng cố định
    defaultHeight: 320 // Chiều cao mặc định ban đầu
  });
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fake loading
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Data gốc
  const weighingHistory = useMemo(() => Object.values(mockApiData), []);

  // Filtered data
  const filteredHistory = useMemo(() => {
    if (!debouncedTerm) return weighingHistory;
    const lower = debouncedTerm.toLowerCase();
    return weighingHistory.filter((item) =>
      [item.code, item.name, item.solo, item.somay, item.user]
        .some((field) => field.toLowerCase().includes(lower))
    );
  }, [debouncedTerm, weighingHistory]);

  // Responsive rowHeight
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const rowHeight = isMobile ? 320 : 180;

  return {
    searchTerm,
    setSearchTerm,
    isPageLoading,
    filteredHistory,
    rowHeight,
    cache,
  };
}
