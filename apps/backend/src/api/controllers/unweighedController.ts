// apps/backend/src/api/controllers/unweighedController.ts
import { Request, Response } from 'express';
import { getPool } from '../../config/db';
//import sql from 'mssql';

/**
 * API: GET /api/unweighed/summary
 * Trả về tóm tắt các mã code chưa cân (nhập/xuất), nhóm theo OVNO
 */
export const getUnweighedSummary = async (req: Request, res: Response) => {
 try {
  const pool = getPool();

  // Query này sẽ JOIN WorkS với History 2 LẦN
    // 1. Join H_nhap: để kiểm tra xem đã cân nhập chưa
    // 2. Join H_xuat: để kiểm tra xem đã cân xuất chưa
  const summaryQuery = `
   SELECT 
    W.OVNO,
    W.Memo,
    W.Qty AS totalTargetQty,
    COUNT(S.QRCode) AS totalPackages,
    
    -- Đếm số lượng mã code CHƯA CÓ trong bảng History (với loai = 'nhap')
    COUNT(CASE WHEN H_nhap.QRCode IS NULL THEN 1 END) AS chuaCanNhap,
    
    -- Đếm số lượng mã code ĐÃ CÓ (nhap) NHƯNG CHƯA CÓ (xuat)
    COUNT(CASE WHEN H_nhap.QRCode IS NOT NULL AND H_xuat.QRCode IS NULL THEN 1 END) AS chuaCanXuat
   
   FROM 
    Outsole_VML_Work AS W
   LEFT JOIN 
    Outsole_VML_WorkS AS S ON W.OVNO = S.OVNO
   LEFT JOIN 
    Outsole_VML_History AS H_nhap ON S.QRCode = H_nhap.QRCode AND H_nhap.loai = 'nhap'
   LEFT JOIN 
    Outsole_VML_History AS H_xuat ON S.QRCode = H_xuat.QRCode AND H_xuat.loai = 'xuat'
   
   GROUP BY 
    W.OVNO, W.Memo, W.Qty
   
   -- Chỉ hiển thị các OVNO có công việc chưa hoàn thành
   HAVING 
    COUNT(CASE WHEN H_nhap.QRCode IS NULL THEN 1 END) > 0 
    OR COUNT(CASE WHEN H_nhap.QRCode IS NOT NULL AND H_xuat.QRCode IS NULL THEN 1 END) > 0
   
   ORDER BY 
    W.OVNO DESC
  `;

  const result = await pool.request().query(summaryQuery);

  // Format dữ liệu trả về
  const responseData = result.recordset.map(item => ({
   ovNO: item.OVNO,
   memo: item.Memo,
   totalTargetQty: parseFloat(item.totalTargetQty.toFixed(2)),
      totalPackages: item.totalPackages,
   chuaCanNhap: item.chuaCanNhap,
   chuaCanXuat: item.chuaCanXuat
  }));

  res.json(responseData);

 } catch (err: unknown) {
  console.error('Lỗi khi lấy dữ liệu chưa cân:');
  if (err instanceof Error) {
   console.error(err.message);
  } else {
   console.error(err);
  }
  res.status(500).send({ message: 'Lỗi máy chủ nội bộ khi lấy dữ liệu chưa cân' });
 }
};