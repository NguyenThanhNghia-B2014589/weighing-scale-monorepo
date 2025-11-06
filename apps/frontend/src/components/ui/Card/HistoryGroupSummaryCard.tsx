import React from "react";
import type { GroupedHistoryData } from "../../../hooks/useHistoryPage";

interface HistoryGroupSummaryCardProps {
  data: GroupedHistoryData;
}

const formatNumber = (num?: number, digits = 3) =>
  typeof num === "number" ? num.toFixed(digits) : "0.000";

const HistoryGroupSummaryCard: React.FC<HistoryGroupSummaryCardProps> = ({
  data,
}) => {
  const {
    ovNO,
    memo,
    totalTargetQty,
    totalNhap,
    totalXuat,
    y_TotalPackages,
    x_WeighedNhap,
  } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 p-3 bg-green-100 border border-green-300 rounded-lg shadow-sm font-semibold text-green-900 mb-2">
      <div>
        <span className="text-gray-600">OVNO: </span>
        <span className="font-bold">{ovNO}</span>
      </div>
      <div>
        <span className="text-gray-600">Số mẻ: </span>
        <span>
          {x_WeighedNhap ?? 0}/{y_TotalPackages ?? 0}
        </span>
      </div>
      <div>
        <span className="text-gray-600">Nhập: </span>
        <span>
          {formatNumber(totalNhap)} / {formatNumber(totalTargetQty)} kg
        </span>
      </div>
      <div>
        <span className="text-gray-600">Xuất: </span>
        <span>
          {formatNumber(totalXuat)} / {formatNumber(totalNhap)} kg
        </span>
      </div>
      <div>
        <span className="text-gray-600">Memo: </span>
        <span>{memo || "N/A"}</span>
      </div>
    </div>
  );
};

export default HistoryGroupSummaryCard;
