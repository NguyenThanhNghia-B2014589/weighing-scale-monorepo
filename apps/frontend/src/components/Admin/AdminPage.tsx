import React from "react";
import { List, AutoSizer, CellMeasurer } from "react-virtualized";
import "react-virtualized/styles.css"; // Đảm bảo bạn đã import file CSS này
import { motion} from 'framer-motion';

import HistoryCard from "../ui/Card/HistoryCard";
import AdminPageSkeleton from "./AdminPageSkeleton";
import type { ListRowProps } from "react-virtualized";
import { useAdminPageLogic } from "../../hooks/useAdminPage"; 

// Biến HistoryCard thành một component có thể được animate bởi Framer Motion
const AnimatedHistoryCard = motion(HistoryCard);

function AdminPage() {
  const {
    searchTerm,
    cache,
    isPageLoading,
    filteredHistory,
    cardVariants,
    uniqueNames,
    selectedName,
    selectedDate,
    setSearchTerm,
    setSelectedName,
    setSelectedDate,
  } = useAdminPageLogic();

  // Hiển thị bộ khung trong khi tải trang
  if (isPageLoading) return <AdminPageSkeleton />

  const rowRenderer = ({ index, key, parent, style }: ListRowProps) => {
    const item = filteredHistory[index];
    return (
      <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        {({ registerChild }) => (
          <div ref={registerChild} style={style} className="p-2">
            <AnimatedHistoryCard
              data={item}
              variants={cardVariants} // 2. SỬ DỤNG variants TỪ HOOK
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              layout
            />
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
          <h1 className="text-xl lg:text-2xl font-bold text-blue-900 flex-shrink-0">
            Trang Quản Trị - Lịch Sử Cân
          </h1>
          
          {/* Nhóm các bộ lọc và tìm kiếm */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Tên phôi keo Dropdown */}
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tên phôi keo</option>
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
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 flex-1 min-h-screen">
        {filteredHistory.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                rowCount={filteredHistory.length}
                rowHeight={cache.rowHeight} // Lấy chiều cao động từ cache
                rowRenderer={rowRenderer}
                className="no-scrollbar"
                data={filteredHistory} // Giúp List biết khi nào cần re-render
              />
            )}
          </AutoSizer>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Không tìm thấy kết quả nào.
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminPage;