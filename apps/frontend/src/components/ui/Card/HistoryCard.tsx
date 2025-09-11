// src/components/ui/Card/HistoryCard.tsx

import React, { forwardRef } from 'react'; // 1. Import forwardRef
import { WeighingData } from '../../../data/weighingData';

// Component này nhận dữ liệu của một lần cân qua props
interface HistoryCardProps {
  data: WeighingData;
}

// Bọc component bằng forwardRef
const HistoryCard = forwardRef<HTMLDivElement, HistoryCardProps>(({ data }, ref) => {
  const tableHeaders = ["Mã Code", "Tên Phôi Keo", "Số Lô", "Số Máy", "Khối Lượng Mẻ(g)", "Khối Lượng Cân(g)"];
  
  // Sắp xếp lại dữ liệu để khớp với tiêu đề
  const tableValues = [
    data.code,
    data.name,
    data.solo,
    data.somay,
    data.weight.toFixed(1),
    data.finalWeight.toFixed(1)
  ];

  return (
    // Gắn ref vào div cha
    <div ref={ref} className="bg-[#90c5ab] rounded-lg p-4 shadow-md text-black font-semibold h-full">
      <div className="flex justify-start items-center gap-x-12 mb-4 text-sm">
        <span>Số thẻ: <span className="font-bold">{data.userID}</span></span>
        <span>Người thao tác: <span className="font-bold">{data.user}</span></span>
        <span>Thời gian cân: <span className="font-bold">{data.time}</span></span>
      </div>

      {/* Bảng thông tin chi tiết */}
      <div className="rounded-md overflow-hidden">
        <div className="grid grid-cols-6">
          {/* Tiêu đề bảng */}
          {tableHeaders.map((header) => (
            <div key={header} className="bg-sky-300 text-black text-center p-2 font-bold border-r border-sky-400 last:border-r-0">
              {header}
            </div>
          ))}
          {/* Dữ liệu bảng */}
          {tableValues.map((value, index) => (
            <div key={index} className="bg-white text-gray-800 text-center p-3 border-r border-gray-200 last:border-r-0">
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default HistoryCard;