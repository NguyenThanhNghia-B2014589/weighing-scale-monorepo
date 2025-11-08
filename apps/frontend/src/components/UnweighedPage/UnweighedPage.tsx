// apps/frontend/src/components/UnweighedPage/UnweighedPage.tsx
import React from 'react';
import { useUnweighedPage } from '../../hooks/useUnweighedPage';
import UnweighedSummaryCard from '../ui/Card/UnweighedSummaryCard';

// Bạn có thể copy AdminPageSkeleton và đổi tên nếu muốn
// import AdminPageSkeleton from '../HistoryPage/HistoryPageSkeleton'; 

function UnweighedPage() {
 const {
  data,
  isLoading,
  refreshData,
  lastRefresh,
  formatLastRefresh,
 } = useUnweighedPage();

 return (
  <div className="flex flex-col h-full">
   {/* --- Thanh điều khiển --- */}
   <div className="bg-sky-200 p-3 shadow border-b-2 border-blue-900/80">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
     <h1 className="text-3xl lg:text-2xl font-bold text-gray-800 flex-shrink-0 px-5">
      Quản Lý Mã Chưa Cân
     </h1>
     
     <div className="flex items-center gap-3 pr-5">
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

   {/* --- Danh sách Card --- */}
   <div className="flex-1 p-4 overflow-y-auto space-y-3">
    {isLoading ? (
     <p className="text-center text-gray-500 mt-10">Đang tải dữ liệu...</p>
          // Hoặc dùng Skeleton: <AdminPageSkeleton />
    ) : data.length > 0 ? (
     data.map(group => (
      <UnweighedSummaryCard key={group.ovNO} data={group} />
     ))
    ) : (
     <p className="text-center text-gray-500 mt-10">
      Tuyệt vời! Không có mã nào đang chờ.
     </p>
    )}
   </div>
  </div>
 );
}

export default UnweighedPage;