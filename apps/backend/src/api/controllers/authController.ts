import { Request, Response } from 'express';
import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginUser = async (req: Request, res: Response) => {
  const { userID, password } = req.body;

  try {
    const queryText = 'SELECT * FROM users WHERE user_id = $1';
    const { rows } = await pool.query(queryText, [userID]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'UserID hoặc mật khẩu không đúng' });
    }
    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'UserID hoặc mật khẩu không đúng' });
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in .env file');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        userID: user.user_id,
        userName: user.user_name,
        role: user.role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};