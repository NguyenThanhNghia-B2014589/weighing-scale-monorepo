/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ui/Card/HistoryCard.tsx

import React from 'react';

// Định nghĩa kiểu dữ liệu phù hợp với backend
interface GroupedHistoryData {
  ovNO: string;
  memo: string;
  totalTargetQty: number;
  totalNhap: number;
  totalXuat: number;
  y_TotalPackages: number;
  x_WeighedNhap: number;
  records: any[];
}

interface HistoryCardProps {
  data: GroupedHistoryData;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ data }) => {
  // Tính toán phần trăm tiến độ
  const progressPercent = data.y_TotalPackages > 0 
    ? Math.round((data.x_WeighedNhap / data.y_TotalPackages) * 100) 
    : 0;

  // Tính tồn kho
  const stock = data.totalNhap - data.totalXuat;

  // Lấy tên phôi keo đầu tiên (vì có thể có nhiều records)
  const tenPhoiKeo = data.records.length > 0 ? data.records[0].tenPhoiKeo : 'N/A';

  const tableValues = [
    data.ovNO,
    data.memo || 'N/A',
    tenPhoiKeo,
    data.totalTargetQty.toFixed(1),
    data.totalNhap.toFixed(1),
    data.totalXuat.toFixed(1),
    `${progressPercent}% (${data.x_WeighedNhap}/${data.y_TotalPackages})`,
    `Tồn: ${stock.toFixed(1)}kg`
  ];

  return (
    <div>
      <div className="grid grid-cols-8">
        {tableValues.map((value, index) => (
          <div 
            key={index} 
            className="bg-white text-gray-800 text-center p-3 border-r border-gray-200 last:border-r-0"
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryCard;