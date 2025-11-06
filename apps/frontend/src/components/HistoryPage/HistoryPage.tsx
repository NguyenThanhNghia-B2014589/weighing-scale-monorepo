// src/components/HistoryPage/HistoryPage.tsx
import React, { useMemo, useEffect, useRef } from "react";
import { List, AutoSizer, CellMeasurer } from "react-virtualized";
import "react-virtualized/styles.css";
//import { motion } from 'framer-motion';

// Import các component card mới
import HistoryRecordCard from "../ui/Card/HistoryRecordCard"; 
import HistoryGroupSummaryCard from "../ui/Card/HistoryGroupSummaryCard"; 
import AdminPageSkeleton from "./HistoryPageSkeleton";
import type { ListRowProps } from "react-virtualized";

import type { 
  GroupedHistoryData, 
  HistoryRecord, 
  AdminPageLogicReturn // Type chúng ta vừa export
} from "../../hooks/useHistoryPage";

// Định nghĩa kiểu cho dữ liệu đã làm phẳng
type FlatListItem = 
  | { type: 'summary'; data: GroupedHistoryData }
  | { type: 'record'; data: HistoryRecord; recordIndex: number };

function HistoryPage(props: AdminPageLogicReturn) {
  const {
    searchTerm,
    cache,
    isPageLoading,
    filteredHistory,
    tableHeaders,
    uniqueNames,
    selectedName,
    selectedDate,
    lastRefresh,
    refreshData,
    formatLastRefresh,
    setSearchTerm,
    setSelectedName,
    setSelectedDate,
    isDateMatch,
  } =props;

  // --- BƯỚC 1: LÀM PHẲNG DỮ LIỆU ---
  // ĐÃ DI CHUYỂN LÊN TRÊN CÙNG (trước câu lệnh return)
  const flattenedData: FlatListItem[] = useMemo(() => {
    const flatList: FlatListItem[] = [];
    // Chuyển search term thành chữ thường 1 lần
    const lowerCaseTerm = searchTerm.toLowerCase();
  
    filteredHistory.forEach(group => {
      
    // Bắt đầu với tất cả record của group (group này đã được lọc bởi hook)
    let recordsToShow = group.records;

    // 1. Lọc theo Ngày (logic cũ đã đúng)
    if (selectedDate) {
      recordsToShow = recordsToShow.filter(record => isDateMatch(record.mixTime, selectedDate));
    }

    // 2. Lọc theo Search Term (LOGIC MỚI)
    if (lowerCaseTerm) {
      // Kiểm tra xem search term có khớp với OVNO của group không
      const groupMatch = group.ovNO && group.ovNO.toLowerCase().includes(lowerCaseTerm);

      // Nếu search term KHÔNG khớp với group (ví dụ: search 'nhap')
      // thì chúng ta mới lọc các record bên trong
      if (!groupMatch) { 
        recordsToShow = recordsToShow.filter(r => 
          (r.maCode && r.maCode.toLowerCase().includes(lowerCaseTerm)) ||
          (r.tenPhoiKeo && r.tenPhoiKeo.toLowerCase().includes(lowerCaseTerm)) ||
          (r.soLo && r.soLo.toString().includes(lowerCaseTerm)) ||
          (r.soMay && r.soMay.toLowerCase().includes(lowerCaseTerm)) ||
          (r.nguoiThaoTac && r.nguoiThaoTac.toLowerCase().includes(lowerCaseTerm)) ||
          (r.loai && r.loai.toLowerCase().includes(lowerCaseTerm))
        );
      }
      // Nếu search term khớp với group (ví dụ: search 'PD2025'),
      // chúng ta KHÔNG lọc, mà hiển thị tất cả record của group đó.
    }

    // Thêm hàng tóm tắt
    flatList.push({ type: 'summary', data: group });
   
      // Chỉ thêm các record đã được lọc (recordsToShow)
    flatList.push(...recordsToShow.map((record, index) => ({ 
        type: 'record', 
        data: record, 
        recordIndex: index 
    } as FlatListItem)));
  });
  return flatList;
    // Thêm searchTerm vào mảng dependencies
 }, [filteredHistory, selectedDate, isDateMatch, searchTerm]);

   const listRef = useRef<List>(null);

  useEffect(() => {
    cache.clearAll();
    listRef.current?.recomputeRowHeights();
  }, [flattenedData, cache]);

  // Hiển thị bộ khung trong khi tải trang
  if (isPageLoading) return <AdminPageSkeleton />

  // --- BƯỚC 2: CẬP NHẬT ROW RENDERER ---
  const rowRenderer = ({ index, key, parent, style }: ListRowProps) => {
    const item = flattenedData[index]; 

    const itemStyle = item.type === 'summary' 
        ? { ...style, padding: '8px 8px 4px 8px' } 
        : { ...style, padding: '4px 8px 8px 8px' }; 

    return (
      <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        {({ registerChild,  }) => (
          <div ref={registerChild as React.RefCallback<HTMLDivElement>} style={itemStyle}>
            <div>
              {item.type === 'summary' ? (
                <HistoryGroupSummaryCard data={item.data as GroupedHistoryData} />
              ) : (
                <HistoryRecordCard 
                  data={item.data as HistoryRecord} 
                  // Truyền prop isStriped
                  // (item.recordIndex % 2 === 0) sẽ là chẵn (trắng)
                  // (item.recordIndex % 2 !== 0) sẽ là lẻ (xám)
                  isStriped={item.recordIndex % 2 !== 0} 
                />
              )}
            </div>
          </div>
        )}
      </CellMeasurer>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* --- THANH ĐIỀU KHIỂN MỚI --- */}
      <div className="bg-sky-200 p-3 shadow border-b-2 border-blue-900/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 ">
          <h1 className="text-3xl lg:text-2xl font-bold text-gray-800 flex-shrink-0 px-5">
            Trang Quản Trị - Lịch Sử Cân
          </h1>
          
          {/* Nhóm các bộ lọc và tìm kiếm */}
          <div className="flex items-center gap-2 w-full md:w-auto pr-5">
            {/* Tên phôi keo Dropdown */}
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Tên phôi keo</option>
              {uniqueNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>

            {/* Ngày Input */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Ô tìm kiếm chính */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã, tên, lô, máy..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {/* Thông tin refresh cuối */}
              <span className="text-xs text-gray-500">
                Cập nhật lần cuối: {formatLastRefresh(lastRefresh)}
              </span>
              <button
                onClick={refreshData}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                title={`Làm mới dữ liệu (lần cuối: ${formatLastRefresh()})`}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 md:px-6 flex flex-col overflow-hidden">
        {/* Header bảng */}
        <div className="hidden md:grid grid-cols-9 pl-2 pr-2 mt-4 flex-shrink-0">
          {tableHeaders.map((header) => (
            <div
              key={header}
              className="bg-sky-300 text-black text-center p-2 font-bold border-r border-sky-400 last:border-r-0 text-sm"
            >
              {header}
            </div>
          ))}
        </div>

        {/* Vùng danh sách có thể cuộn */}
        <div className="flex-1 overflow-hidden mt-2">
          <div className="h-[calc(100vh-200px)]"> {/* 👈 đảm bảo có chiều cao cụ thể */}
            {flattenedData.length > 0 ? (
              <AutoSizer>
                {({ height, width }) => {

                  return (
                    <List
                      width={width}
                      height={height || 600} // fallback nếu vẫn 0
                      rowCount={flattenedData.length}
                      rowHeight={cache.rowHeight}
                      rowRenderer={rowRenderer}
                      className="no-scrollbar"
                    />
                  );
                }}
              </AutoSizer>
            ) : (
              <p className="text-center text-gray-500 mt-10">
                Không tìm thấy kết quả nào.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;