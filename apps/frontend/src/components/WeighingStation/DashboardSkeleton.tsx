// src/components/WeighingStation/DashboardSkeleton.tsx

// Component này tạo ra một hàng trong bảng skeleton
const SkeletonTableRow = () => (
  <div className="bg-gray-100 p-3 md:h-20 border-t border-l border-b border-gray-200 md:border-t-0 flex items-center justify-center">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  </div>
);

function DashboardSkeleton() {
  return (
    // Thêm animate-pulse để có hiệu ứng nhấp nháy nhẹ nhàng
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      {/* --- SKELETON CHO KHU VỰC THÔNG TIN TRÊN CÙNG --- */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="space-y-4 w-full">
          {/* Trọng lượng */}
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          {/* Min/Max */}
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="w-full md:w-auto">
          {/* Nút Hoàn tất */}
          <div className="h-12 bg-gray-200 rounded-lg w-full md:w-32"></div>
        </div>
      </div>

      {/* --- SKELETON CHO BẢNG --- */}
      <div className="mb-8">
        <div className="grid grid-cols-6 border-r border-gray-200">
          {/* Tiêu đề bảng */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-200 p-3 h-12 border-l border-b border-gray-200"></div>
          ))}
          {/* Dữ liệu bảng */}
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonTableRow key={index} />
          ))}
        </div>
      </div>

      {/* --- SKELETON CHO KHU VỰC QUÉT MÃ --- */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Input */}
        <div className="h-16 bg-gray-200 rounded-md w-full"></div>
        {/* Nút Scan */}
        <div className="h-16 bg-gray-200 rounded-md w-full md:w-40"></div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;