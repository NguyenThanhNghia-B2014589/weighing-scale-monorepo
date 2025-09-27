// apps/backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// Import type definition để TypeScript nhận ra
import type { AuthUser } from '../types/express.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Không có token, xác thực thất bại' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET không được định nghĩa');

    // Bây giờ TypeScript sẽ nhận ra req.user
    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Lỗi xác thực token:', error);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};