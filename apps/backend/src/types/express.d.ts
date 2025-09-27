// types/express.d.ts

// Đảm bảo file này được import như một module để TypeScript coi là module augmentation
import 'express';

// Định nghĩa kiểu user (tuỳ bạn chỉnh theo model thực tế)
interface AuthUser {
  id: number;
  role?: 'admin' | 'user' | string;
  // thêm các trường khác nếu cần
}

// Mở rộng kiểu của express request
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
