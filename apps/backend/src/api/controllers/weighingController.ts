// src/api/controllers/weighingController.ts
import { Request, Response } from 'express';
import sql from 'mssql';
import { getPool } from '../../config/db';

export const completeWeighing = async (req: Request, res: Response) => {
  // 1. Lấy dữ liệu (Giữ nguyên)
  const { maCode, khoiLuongCan, thoiGianCan, loai } = req.body;
  const mixTime = new Date(thoiGianCan);

  // 2. Kiểm tra dữ liệu đầu vào (Giữ nguyên)
  if (!maCode || khoiLuongCan == null || !thoiGianCan || !loai) {
    return res.status(401).send({ message: 'Thiếu dữ liệu (maCode, khoiLuongCan, thoiGianCan, loai).' });
  }

  let pool: sql.ConnectionPool | undefined;
  let transaction: sql.Transaction | undefined;
  let ovNO: string; // --- Biến để giữ OVNO ---

  try {
    pool = getPool();

    // --- KIỂM TRA TRƯỚC KHI LƯU ---
    
    // Kiểm tra xem chính mã này đã cân chưa
    const preCheckRequest = pool.request();
    const preCheckResult = await preCheckRequest
      .input('maCodeParam', sql.VarChar(20), maCode)
      .query('SELECT RKQty, MixTime, OVNO FROM Outsole_VML_WorkS WHERE QRCode = @maCodeParam');

    if (preCheckResult.recordset.length === 0) {
      return res.status(404).send({ message: 'Lỗi: Không tìm thấy Mã Code để kiểm tra.' });
    }
    
    const currentData = preCheckResult.recordset[0];
    ovNO = currentData.OVNO; // Lấy OVNO để kiểm tra tổng
    // KIỂM TRA: Kiểm tra nếu là 'nhap' thì maCode đó có nhập hay chưa
    if (loai === 'nhap') {
      // ... (logic kiểm tra "đã cân")
      if (currentData.RKQty != null && currentData.MixTime != null) {
        return res.status(402).send({ message: 'Mã QRCode này đã cân (Nhập)!' });
      }
    }

    // KIỂM TRA: Tổng khối lượng có vượt Qty của Work không?
    if (loai === 'nhap') {
      // Chạy 2 query song song để lấy tổng mục tiêu và tổng đã cân
      
      // Query: Lấy tổng Qty (mục tiêu) từ Outsole_VML_Work
      const targetPromise = pool.request()
        .input('ovNOParam', sql.NVarChar, ovNO) // Giả sử OVNO là NVarChar
        .query('SELECT Qty AS TargetQty FROM Outsole_VML_Work WHERE OVNO = @ovNOParam');

      // Query: Lấy tổng RKQty (đã cân) của TẤT CẢ mã code thuộc OVNO này
      const sumPromise = pool.request()
        .input('ovNOParam', sql.NVarChar, ovNO)
        .query('SELECT SUM(RKQty) AS TotalWeighed FROM Outsole_VML_WorkS WHERE OVNO = @ovNOParam AND RKQty IS NOT NULL');
      
      const [targetResult, sumResult] = await Promise.all([targetPromise, sumPromise]);
      const targetQty = targetResult.recordset[0]?.TargetQty;
      const totalWeighed = sumResult.recordset[0]?.TotalWeighed || 0.0;

      if (targetQty == null) {
        return res.status(405).send({ message: `Lỗi: Không tìm thấy tổng khối lượng (Qty) cho OVNO ${ovNO}.` });
      }

      const newTotal = totalWeighed + khoiLuongCan;
      if (newTotal > (targetQty + 0.001)) {
        return res.status(403).send({ 
          message: `Lỗi: Vượt quá tổng khối lượng cho phép! (Tổng đã cân: ${totalWeighed}kg / Lần này: ${khoiLuongCan}kg / Cho phép: ${targetQty}kg)` 
        });
      }
    }

    // KIỂM TRA: Tổng khối lượng cân xuất có vượt quá khối lượng đã nhập
    if (loai === 'xuat') {
      // Kiểm tra xem đã có bản ghi 'nhap' cho chính maCode này trong History chưa
      const nhapCheck = await pool.request()
        .input('maCodeParam', sql.VarChar(20), maCode)
        .query(`
          SELECT 1 AS NhapExists
          FROM Outsole_VML_History
          WHERE QRCode = @maCodeParam AND loai = 'nhap'
        `);

      if (nhapCheck.recordset.length === 0) {
        // Nếu không tìm thấy (length = 0), nghĩa là CHƯA CÂN NHẬP
        return res.status(406).send({ 
          message: `Lỗi: Mã QRCode này chưa được cân nhập!` 
        });
      }
      // Lấy tổng Nhập và Xuất HIỆN TẠI cho OVNO này
      // (Chúng ta phải Join với WorkS để lọc theo OVNO)
      const balanceCheck = await pool.request()
        .input('ovNOParam', sql.NVarChar, ovNO) // Giả sử OVNO là NVarChar
        .query(`
          SELECT 
            ISNULL(SUM(CASE WHEN H.loai = 'nhap' THEN H.KhoiLuongCan ELSE 0 END), 0) AS TotalNhap,
            ISNULL(SUM(CASE WHEN H.loai = 'xuat' THEN H.KhoiLuongCan ELSE 0 END), 0) AS TotalXuat
          FROM Outsole_VML_History AS H
          INNER JOIN Outsole_VML_WorkS AS S ON H.QRCode = S.QRCode
          WHERE S.OVNO = @ovNOParam
        `);
      
      const { TotalNhap, TotalXuat } = balanceCheck.recordset[0];
      const currentWeighAmount = parseFloat(khoiLuongCan); 
      const totalAfterWeighing = TotalXuat + currentWeighAmount;
      const currentStock = TotalNhap - TotalXuat;

      if (totalAfterWeighing > (TotalNhap + 0.001)) {
        return res.status(406).send({ 
          message: `Lỗi: Khối lượng xuất vượt quá tồn kho! (Tồn: ${currentStock.toFixed(3)}kg / Muốn xuất: ${khoiLuongCan}kg)` 
        });
      }
    }
    // --- KẾT THÚC KIỂM TRA ---

    // 4. Bắt đầu Transaction (Giữ nguyên)
    transaction = pool.transaction();
    await transaction.begin();

    // 5. CẬP NHẬT Outsole_VML_WorkS (Giữ nguyên)
    const updateWorkSRequest = new sql.Request(transaction);
    await updateWorkSRequest
      .input('maCodeParam', sql.VarChar(20), maCode)
      .input('mixTimeParam', sql.SmallDateTime, mixTime)
      .input('khoiLuongCanParam', sql.Money, khoiLuongCan)
      .query(`
        UPDATE Outsole_VML_WorkS 
        SET MixTime = @mixTimeParam, RKQty = @khoiLuongCanParam
        WHERE QRCode = @maCodeParam
      `);

    // 6. INSERT vào Outsole_VML_History (Giữ nguyên)
    const insertHistoryRequest = new sql.Request(transaction);
    await insertHistoryRequest
      .input('maCodeParam', sql.VarChar(20), maCode)
      .input('timeWeighParam', sql.SmallDateTime, mixTime)
      .input('khoiLuongCanParam', sql.Money, khoiLuongCan)
      .input('loaiParam', sql.VarChar(10), loai)
      .query(`
        INSERT INTO Outsole_VML_History (QRCode, TimeWeigh, KhoiLuongCan, loai)
        VALUES (@maCodeParam, @timeWeighParam, @khoiLuongCanParam, @loaiParam)
      `);

    // 7. Commit (Giữ nguyên)
    await transaction.commit();
    
    // --- 8. LẤY DỮ LIỆU TÓM TẮT MỚI (SAU KHI COMMIT) ---
    // (Đây là code copy từ scanController)
    const workPromise = pool.request()
      .input('ovNOParam', sql.NVarChar, ovNO)
      .query('SELECT Qty AS TotalTargetQty, Memo FROM Outsole_VML_Work WHERE OVNO = @ovNOParam');
    
    const historySummaryPromise = pool.request()
      .input('ovNOParam', sql.NVarChar, ovNO)
      .query(`
        SELECT 
          ISNULL(SUM(CASE WHEN H.loai = 'nhap' THEN H.KhoiLuongCan ELSE 0 END), 0) AS TotalNhapWeighed,
          ISNULL(SUM(CASE WHEN H.loai = 'xuat' THEN H.KhoiLuongCan ELSE 0 END), 0) AS TotalXuatWeighed
        FROM Outsole_VML_History AS H
        INNER JOIN Outsole_VML_WorkS AS S ON H.QRCode = S.QRCode
        WHERE S.OVNO = @ovNOParam
      `);
      
    const [workResult, historySummaryResult] = await Promise.all([workPromise, historySummaryPromise]);

    const workRecord = workResult.recordset[0] || {};
    const historySummary = historySummaryResult.recordset[0] || {};
    
    // 9. Gửi dữ liệu tóm tắt MỚI về
    res.status(201).send({ 
      message: 'Đã lưu kết quả cân thành công.',
      // Gửi kèm 'summaryData'
      summaryData: {
        totalTargetQty: workRecord.TotalTargetQty || 0.0,
        totalNhapWeighed: historySummary.TotalNhapWeighed || 0.0,
        totalXuatWeighed: historySummary.TotalXuatWeighed || 0.0,
        memo: workRecord.Memo,
      }
    });
    // --- KẾT THÚC SỬA ---

  } catch (err: unknown) {
    console.error('Lỗi Transaction khi hoàn tất cân:');

    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }

    // Rollback nếu lỗi
    if (transaction) {
      await transaction.rollback();
    }

    res.status(500).send({ message: 'Lỗi server khi lưu dữ liệu cân.' });
  }
};