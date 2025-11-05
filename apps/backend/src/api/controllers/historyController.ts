/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/controllers/historyController.ts
import { Request, Response } from 'express';
import { getPool } from '../../config/db';

export const getHistory = async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    // 1. Lấy TẤT CẢ bản ghi lịch sử (đã join)
    // (Đây là query cũ của bạn, rất tốt)
    const historyResult = await pool.request().query(`
      SELECT 
        H.QRCode AS maCode, H.TimeWeigh AS mixTime, H.KhoiLuongCan AS realQty, H.loai,
        S.OVNO AS ovNO, S.Package AS package, S.MUserID, S.Qty AS qtys,
        W.FormulaF1 AS tenPhoiKeo, W.Machine_NO AS soMay, W.Qty AS totalTargetQty, W.Memo,
        P.UserName AS nguoiThaoTac,
        S.Package AS soLo 
      FROM 
        Outsole_VML_History AS H
      LEFT JOIN Outsole_VML_WorkS AS S ON H.QRCode = S.QRCode
      LEFT JOIN Outsole_VML_Work AS W ON S.OVNO = W.OVNO
      LEFT JOIN Outsole_VML_Persion AS P ON S.MUserID = P.MUserID
      WHERE H.TimeWeigh IS NOT NULL
      ORDER BY 
        S.OVNO, H.TimeWeigh DESC 
    `);

    const records = historyResult.recordset;

    // --- 2. LẤY DỮ LIỆU ĐẾM PACKAGE (Tất cả OVNO) ---
    // (Query này chạy 1 lần lấy hết)
    const packageCountResult = await pool.request().query(`
      SELECT 
        OVNO, 
        COUNT(*) AS Y_TotalPackages
      FROM Outsole_VML_WorkS
      GROUP BY OVNO
    `);
    // Tạo Map để tra cứu Y (Tổng package)
    const yTotalMap = new Map<string, number>();
    for (const row of packageCountResult.recordset) {
      yTotalMap.set(row.OVNO, row.Y_TotalPackages);
    }

    // 3. Xử lý và Nhóm dữ liệu trong Node.js
    const groupedData: any = {};

    for (const record of records) {
      const ovNO = record.ovNO;

      // Nếu chưa có nhóm này, tạo nhóm
      if (!groupedData[ovNO]) {
        const y_Total = yTotalMap.get(ovNO) || 0;
        groupedData[ovNO] = {
          ovNO: ovNO,
          memo: record.Memo,
          totalTargetQty: record.totalTargetQty,
          totalNhap: 0.0,
          totalXuat: 0.0,
          y_TotalPackages: y_Total,
          weighedNhapPackages: new Set<string>(),
          records: [], // Danh sách chứa các bản ghi con
        };
      }

      // Thêm bản ghi vào nhóm
      groupedData[ovNO].records.push(record);

      // Tính toán tổng cho hàng tóm tắt
      if (record.loai === 'nhap' && record.realQty) {
        groupedData[ovNO].totalNhap += record.realQty;
        groupedData[ovNO].weighedNhapPackages.add(record.maCode);
      } else if (record.loai === 'xuat' && record.realQty) {
        groupedData[ovNO].totalXuat += record.realQty;
      }
    }

    // 4. Chuyển đổi từ Object sang Array để trả về
    const responseArray = Object.values(groupedData).map((group: any) => {
      // Đếm X (số lượng maCode đã cân nhập)
      group.x_WeighedNhap = group.weighedNhapPackages.size;
      delete group.weighedNhapPackages; // Xóa Set đi
      return group;
    });

    res.json(responseArray);

  } catch (err: unknown) {
    console.error('Lỗi khi truy vấn lịch sử (đã nhóm):');

    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }

    res.status(500).send({ message: 'Lỗi máy chủ nội bộ khi lấy lịch sử' });
  }
};