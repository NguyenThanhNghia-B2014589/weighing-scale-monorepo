import React from "react";
import type { HistoryRecord } from "../../../hooks/useHistoryPage";

interface HistoryRecordCardProps {
  data: HistoryRecord;
  isStriped: boolean;
}

const HistoryRecordCard: React.FC<HistoryRecordCardProps> = ({ data, isStriped }) => {
  const formatDateTime = (isoString: string) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return isoString;
    }
  };

  const formatNumber = (num?: number, digits = 3) =>
    typeof num === "number" ? num.toFixed(digits) : "0.000";

  const loaiStyles =
    data.loai?.toLowerCase() === "nhap"
      ? "text-green-600 font-bold"
      : "text-red-600 font-bold";

  const tableValues = [
    data.maCode,
    data.tenPhoiKeo,
    data.soLo,
    data.soMay,
    data.nguoiThaoTac,
    formatDateTime(data.mixTime),
    formatNumber(data.qtys),
    formatNumber(data.realQty),
    <span key="loai" className={loaiStyles}>
      {data.loai}
    </span>,
  ];

  const rowClassName = `
    grid grid-cols-9 
    rounded-lg border border-gray-200 
    shadow-sm hover:shadow-md transition-all duration-200
    ${isStriped ? 'bg-gray-200' : 'bg-white'} 
  `; // <-- Thêm logic bg-white / bg-gray-50

  return (
    <div className={rowClassName}>
      {tableValues.map((value, index) => (
        <div
          key={index}
          className="text-gray-800 text-center p-2 border-r border-gray-200 last:border-r-0 break-words text-sm"
        >
          {value}
        </div>
      ))}
    </div>
  );
};

export default HistoryRecordCard;
