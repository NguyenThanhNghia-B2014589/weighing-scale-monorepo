// src/config/db.ts
import sql from 'mssql';
import 'dotenv/config';

// Kiểm tra các biến môi trường cần thiết
const { DB_USER, DB_PASSWORD, DB_DATABASE, DB_SERVER, PORT } = process.env;
if (!DB_USER || !DB_PASSWORD || !DB_DATABASE || !DB_SERVER || !PORT) {
  console.error('FATAL ERROR: Missing database configuration in .env file.');
  process.exit(1); // Exit if config is missing
}

// Xác định cấu hình DB
export const dbConfig: sql.config = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_SERVER,
  pool: {
    max: 10, // Số lượng kết nối tối đa trong pool
    min: 0,
    //idleTimeoutMillis: 30000 // Đóng các kết nối nhàn rỗi sau 30 giây
  },
  options: {
    trustServerCertificate: true, // Usually needed for local/dev SQL Server
    // encrypt: true, // Use true for production with Azure SQL or trusted certificates
    useUTC: false
  },
};

let pool: sql.ConnectionPool | null = null;

// kết nối với pool
export async function connectDb() {
  if (pool) return pool; // Trả về pool đã kết nối nếu đã có
  try {
    console.log("Attempting to connect to database...");
    pool = await sql.connect(dbConfig);
    console.log('Database connection successful!');

    // Lắng nghe lỗi pool
    pool.on('error', (err: Error) => {
      console.error('SQL Pool Error:', err.message);
    });

    return pool;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Database connection failed:', err.message);
    } else {
      console.error('Database connection failed: Unknown error', err);
    }
    // Thoát ứng dụng nếu không kết nối được DB
    process.exit(1);
  }
}


// Lấy pool đã kết nối
export function getPool(): sql.ConnectionPool {
    if (!pool) {
        throw new Error("Database not connected. Call connectDb first.");
    }
    return pool;
}

// Đóng kết nối DB
export async function closeDb() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("Database connection closed.");
  }
}