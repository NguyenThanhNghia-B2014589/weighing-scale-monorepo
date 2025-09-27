// apps/backend/src/api/controllers/historyController.ts
import { Request, Response } from 'express';
import pool from '../../config/db.js';

export const getWeighingHistory = async (req: Request, res: Response) => {
  try {
    // Viết câu lệnh SQL để lấy tất cả lịch sử, sắp xếp theo thời gian mới nhất
    const queryText = 'SELECT * FROM weighing_history ORDER BY time DESC';
    const { rows } = await pool.query(queryText);
    
    // Trả về danh sách lịch sử
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử cân' });
  }
};