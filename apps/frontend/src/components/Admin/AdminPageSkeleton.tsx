// src/components/AdminPage/AdminPageSkeleton.tsx

import React from 'react';

// Component con cho một thẻ lịch sử skeleton
const SkeletonHistoryCard = () => (
  <div className="bg-gray-200 rounded-lg p-4 shadow-md">
    {/* Hàng thông tin trên cùng */}
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    </div>
    {/* Bảng skeleton */}
    <div className="bg-gray-300 rounded-md p-2 h-24"></div>
  </div>
);


function AdminPageSkeleton() {
  return (
    // Thêm animate-pulse để có hiệu ứng nhấp nháy
    <div className="p-4 md:p-8 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        {/* Tiêu đề skeleton */}
        <div className="h-8 bg-gray-300 rounded w-1/2 md:w-1/3 mb-4 md:mb-0"></div>
        {/* Ô tìm kiếm skeleton */}
        <div className="h-10 bg-gray-300 rounded-lg w-full md:w-1/3"></div>
      </div>
      
      {/* Danh sách các thẻ skeleton */}
      <div className="flex flex-col gap-6">
        <SkeletonHistoryCard />
        <SkeletonHistoryCard />
        <SkeletonHistoryCard />
        <SkeletonHistoryCard />
        <SkeletonHistoryCard />
      </div>
    </div>
  );
}

export default AdminPageSkeleton;