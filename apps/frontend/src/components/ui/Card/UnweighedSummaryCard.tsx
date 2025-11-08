// apps/frontend/src/components/ui/Card/UnweighedSummaryCard.tsx
import React from 'react';
import type { UnweighedSummary } from '../../../hooks/useUnweighedPage';

interface CardProps {
 data: UnweighedSummary;
}

const UnweighedSummaryCard: React.FC<CardProps> = ({ data }) => {
 const {
  ovNO,
  memo,
    totalPackages,
  chuaCanNhap,
  chuaCanXuat
 } = data;

  // Dùng màu Vàng (warning) và Cam (caution)
 return (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg shadow-sm font-semibold text-yellow-900">
   
   {/* OVNO (2 cột) */}
   <div className="col-span-1 md:col-span-2">
    <span className="text-gray-600">OVNO: </span>
    <span className="font-bold">{ovNO}</span>
   </div>

   {/* Chưa cân Nhập (1 cột) */}
   <div className="col-span-1 md:col-span-1">
    <span className="text-gray-600">Chưa Cân Nhập: </span>
    <span className="text-red-600 font-bold text-lg">{chuaCanNhap}</span>
        <span className="text-gray-600 text-sm"> / {totalPackages}</span>
   </div>

   {/* Chưa cân Xuất (1 cột) */}
   <div className="col-span-1 md:col-span-1">
    <span className="text-gray-600">Chưa Cân Xuất: </span>
    <span className="text-orange-600 font-bold text-lg">{chuaCanXuat}</span>
   </div>
   
   {/* Memo (1 cột) */}
   <div className="col-span-1 md:col-span-1">
    <span className="text-gray-600">Memo: </span>
    <span>{memo || '---'}</span>
   </div>
  </div>
 );
};

export default UnweighedSummaryCard;