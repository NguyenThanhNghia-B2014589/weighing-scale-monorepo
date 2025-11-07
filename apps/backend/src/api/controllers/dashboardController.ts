// apps/backend/src/api/controllers/dashboardController.ts
import { Request, Response } from 'express';
import { getPool } from '../../config/db';
import sql from 'mssql';

/**
 * API: GET /api/dashboard/inventory-summary
 * Trả về dữ liệu tổng quan tồn kho và phân bổ theo loại phôi keo
 * Dùng cho Two Level Pie Chart
 */
export const getInventorySummary = async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    // Query 1: Lấy tổng quan tồn kho (Nhập, Xuất, Tồn) - Dùng cho vòng trong
    const inventorySummaryQuery = `
      SELECT 
        ISNULL(SUM(CASE WHEN H.loai = 'nhap' THEN H.KhoiLuongCan ELSE 0 END), 0) AS TotalNhap,
        ISNULL(SUM(CASE WHEN H.loai = 'xuat' THEN H.KhoiLuongCan ELSE 0 END), 0) AS TotalXuat
      FROM Outsole_VML_History AS H
    `;
    
    const summaryResult = await pool.request().query(inventorySummaryQuery);
    const { TotalNhap, TotalXuat } = summaryResult.recordset[0];
    const TotalTon = TotalNhap - TotalXuat;

    // Query 2: Lấy tồn kho theo từng loại phôi keo - Dùng cho vòng ngoài
    const inventoryByGlueTypeQuery = `
      SELECT 
        W.FormulaF1 AS tenPhoiKeo,
        ISNULL(SUM(CASE WHEN H.loai = 'nhap' THEN H.KhoiLuongCan ELSE 0 END), 0) AS Nhap,
        ISNULL(SUM(CASE WHEN H.loai = 'xuat' THEN H.KhoiLuongCan ELSE 0 END), 0) AS Xuat,
        ISNULL(SUM(CASE WHEN H.loai = 'nhap' THEN H.KhoiLuongCan ELSE 0 END), 0) - 
        ISNULL(SUM(CASE WHEN H.loai = 'xuat' THEN H.KhoiLuongCan ELSE 0 END), 0) AS Ton
      FROM 
        Outsole_VML_History AS H
      INNER JOIN 
        Outsole_VML_WorkS AS S ON H.QRCode = S.QRCode
      INNER JOIN 
        Outsole_VML_Work AS W ON S.OVNO = W.OVNO
      GROUP BY 
        W.FormulaF1
      HAVING 
        (ISNULL(SUM(CASE WHEN H.loai = 'nhap' THEN H.KhoiLuongCan ELSE 0 END), 0) - 
         ISNULL(SUM(CASE WHEN H.loai = 'xuat' THEN H.KhoiLuongCan ELSE 0 END), 0)) > 0
      ORDER BY 
        Ton DESC
    `;

    const glueTypeResult = await pool.request().query(inventoryByGlueTypeQuery);

    // Chuẩn bị dữ liệu trả về
    const responseData = {
      // Dữ liệu tổng quan (vòng trong)
      summary: {
        totalNhap: parseFloat(TotalNhap.toFixed(2)),
        totalXuat: parseFloat(TotalXuat.toFixed(2)),
        totalTon: parseFloat(TotalTon.toFixed(2))
      },
      // Dữ liệu chi tiết theo loại phôi keo (vòng ngoài)
      byGlueType: glueTypeResult.recordset.map(item => ({
        tenPhoiKeo: item.tenPhoiKeo || 'Không rõ',
        nhap: parseFloat(item.Nhap.toFixed(2)),
        xuat: parseFloat(item.Xuat.toFixed(2)),
        ton: parseFloat(item.Ton.toFixed(2))
      }))
    };

    res.json(responseData);

  } catch (err: unknown) {
    console.error('Lỗi khi lấy dữ liệu tồn kho:');

    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }

    res.status(500).send({ message: 'Lỗi máy chủ nội bộ khi lấy dữ liệu tồn kho' });
  }
};

/**
 * API: GET /api/dashboard/hourly-weighing
 * Trả về dữ liệu cân theo giờ cho một ngày cụ thể
 * Query params: date (format: YYYY-MM-DD)
 */
export const getHourlyWeighing = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
      return res.status(400).send({ message: 'Thiếu tham số date (YYYY-MM-DD)' });
    }

    const pool = getPool();

    // Query: Lấy tổng khối lượng cân theo giờ cho ngày được chọn
    const hourlyQuery = `
      SELECT 
        DATEPART(HOUR, H.TimeWeigh) AS Hour,
        SUM(H.KhoiLuongCan) AS TotalWeight
      FROM 
        Outsole_VML_History AS H
      WHERE 
        H.loai = 'nhap' 
        AND CAST(H.TimeWeigh AS DATE) = @dateParam
      GROUP BY 
        DATEPART(HOUR, H.TimeWeigh)
      ORDER BY 
        Hour
    `;

    const result = await pool.request()
      .input('dateParam', sql.Date, date)
      .query(hourlyQuery);

    // Tạo dữ liệu đầy đủ cho 24 giờ (7:00 - 17:00 cho ca làm việc)
    const workHours = Array.from({ length: 11 }, (_, i) => i + 7);
    const hourlyData = workHours.map(hour => {
      const found = result.recordset.find(r => r.Hour === hour);
      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        totalWeight: found ? parseFloat(found.TotalWeight.toFixed(2)) : 0
      };
    });

    res.json(hourlyData);

  } catch (err: unknown) {
    console.error('Lỗi khi lấy dữ liệu cân theo giờ:');

    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }

    res.status(500).send({ message: 'Lỗi máy chủ nội bộ khi lấy dữ liệu cân theo giờ' });
  }
};

/**
 * API: GET /api/dashboard/weighing-trend
 * Trả về xu hướng số lần cân theo tháng
 * Query params: months (số tháng muốn lấy, mặc định 6)
 */
export const getWeighingTrend = async (req: Request, res: Response) => {
  try {
    const { months = '6' } = req.query;
    const numMonths = parseInt(months as string, 10);

    const pool = getPool();

    const trendQuery = `
      SELECT 
        FORMAT(H.TimeWeigh, 'MM/yyyy') AS MonthYear,
        COUNT(*) AS WeighingCount
      FROM 
        Outsole_VML_History AS H
      WHERE 
        H.loai = 'nhap'
        AND H.TimeWeigh >= DATEADD(MONTH, -@monthsParam, GETDATE())
      GROUP BY 
        FORMAT(H.TimeWeigh, 'MM/yyyy'),
        YEAR(H.TimeWeigh),
        MONTH(H.TimeWeigh)
      ORDER BY 
        YEAR(H.TimeWeigh), MONTH(H.TimeWeigh)
    `;

    const result = await pool.request()
      .input('monthsParam', sql.Int, numMonths)
      .query(trendQuery);

    const trendData = result.recordset.map(item => ({
      date: item.MonthYear,
      weighingCount: item.WeighingCount
    }));

    res.json(trendData);

  } catch (err: unknown) {
    console.error('Lỗi khi lấy xu hướng cân:');

    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }

    res.status(500).send({ message: 'Lỗi máy chủ nội bộ khi lấy xu hướng cân' });
  }
};