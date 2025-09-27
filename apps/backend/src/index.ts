// apps/backend/src/index.ts
import express, { Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import authRoutes from './api/routes/authRoutes.js';
import historyRoutes from './api/routes/historyRoutes.js';

// --------------- Global error handlers (process-level) ----------------
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (error instanceof Error) console.error(error.stack);
  // Depending on needs, consider graceful shutdown instead of immediate exit.
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// --------------- Load env ----------------
dotenv.config();
console.log('✅ dotenv loaded (NODE_ENV=%s)', process.env.NODE_ENV ?? 'undefined');

// --------------- Helper: DB health check ----------------
async function checkDbConnection(): Promise<void> {
  try {
    // Thực hiện truy vấn đơn giản để kiểm tra connection pool
    await pool.query('SELECT NOW()');
    console.log('✅ Kết nối Database thành công');
  } catch (err) {
    console.error('❌ LỖI KẾT NỐI DATABASE:', err);
    throw err;
  }
}

// --------------- Start server ----------------
async function startServer(): Promise<void> {
  try {
    // 1) Kiểm tra DB trước khi mount routes (nếu cần)
    await checkDbConnection();

    // 2) Khởi tạo app
    const app = express();

    // 3) Middlewares
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 4) Mount routes (đảm bảo routes export default là express.Router)
    // Nếu routes export object khác, sửa tương ứng.
    app.use('/api/auth', authRoutes as Router);
    app.use('/api/history', historyRoutes as Router);

    // 5) Health check endpoint (tiện cho monitoring)
    app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));

    // 6) Start listen
    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Backend server đang chạy trên cổng ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Lỗi khi khởi động server:', err);
    process.exit(1); // thoát để process manager hoặc container restart lại
  }
}

// Thực thi
startServer();
