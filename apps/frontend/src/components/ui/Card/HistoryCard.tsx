// src/components/ui/Card/HistoryCard.tsx

import React from 'react';
import { HistoryRecord } from '../../../data/weighingHistoryData';

// Component này nhận dữ liệu của một lần cân qua props
interface HistoryCardProps {
  data: HistoryRecord;
}

/**
 * Format timestamp từ database thành định dạng "HH:mm DD/MM/YYYY"
 * Input: "2025-08-25T02:30:15.000Z" (ISO 8601)
 * Output: "18:43 04/08/2024" (giờ địa phương + múi giờ Việt Nam)
 */
function formatTimestamp(timestamp: string): string {
  if (!timestamp) return '';
  
  try {
    // Tạo Date object từ ISO string
    const date = new Date(timestamp);
    
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) {
      return timestamp;
    }
    
    // Lấy giờ và phút (2 chữ số)
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Lấy ngày, tháng, năm
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Format: "HH:mm DD/MM/YYYY"
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return timestamp;
  }
}

// Component không cần forwardRef nữa
const HistoryCard: React.FC<HistoryCardProps> = ({ data }) => {
  const tableHeaders = ["Mã Code", "Tên Phôi Keo", "Số Lô", "Số Máy", "Khối Lượng Mẻ(g)", "Khối Lượng Cân(g)"];
  
  // Sắp xếp lại dữ liệu để khớp với tiêu đề
  const tableValues = [
    data.code,
    data.name,
    data.solo,
    data.somay,
    data.weight,
    data.final_weight
  ];

  return (
    <div className="bg-[#90c5ab] rounded-lg p-4 shadow-md text-black font-semibold h-full">
      <div className="flex justify-start items-center gap-x-12 mb-4 text-sm">
        <span>Số thẻ: <span className="font-bold">{data.user_id}</span></span>
        <span>Người thao tác: <span className="font-bold">{data.user_name}</span></span>
        <span>Thời gian cân: <span className="font-bold">{formatTimestamp(data.time)}</span></span>
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
};

export default HistoryCard;