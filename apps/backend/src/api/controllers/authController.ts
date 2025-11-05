import { Request, Response } from 'express';
import sql from 'mssql';
import { getPool } from '../../config/db';

export const login = async (req: Request, res: Response) => {
  // 1. Lấy mUserID (Số thẻ) từ body
  const { mUserID } = req.body;

  if (!mUserID) {
    return res.status(400).send({ message: 'Vui lòng nhập Số thẻ (mUserID).' });
  }

  try {
    const pool = getPool();

    // 2. Kiểm tra xem user có tồn tại trong bảng Persion không
    const userResult = await pool.request()
      .input('mUserIDParam', sql.VarChar(20), mUserID) // Dùng kiểu VarChar(20)
      .query('SELECT UserName FROM Outsole_VML_Persion WHERE MUserID = @mUserIDParam');

    if (userResult.recordset.length === 0) {
      // 3. Nếu không tìm thấy
      return res.status(404).send({ message: 'Số thẻ không tồn tại hoặc không hợp lệ.' });
    }

    // 4. Nếu tìm thấy, đăng nhập thành công
    const user = userResult.recordset[0];
    res.status(200).json({
      message: `Đăng nhập thành công! Chào ${user.UserName}`,
      userData: user,
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Lỗi khi đăng nhập ${mUserID}:`, err.message);
    } else {
      console.error(`Lỗi không xác định khi đăng nhập ${mUserID}:`, err);
    }
    res.status(500).send({ message: 'Lỗi máy chủ nội bộ khi đăng nhập' });
  }
};