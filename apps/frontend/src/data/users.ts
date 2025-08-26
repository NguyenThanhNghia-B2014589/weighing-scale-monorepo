// src/data/users.ts

// Định nghĩa kiểu dữ liệu cho một người dùng
export interface User {
  userID: string;
  password: string;
  userName: string;
  role: 'admin' | 'user'; // Có thể có nhiều vai trò khác nhau
}

// Mảng này hoạt động như một "cơ sở dữ liệu" giả lập của chúng ta
export const mockUsers: User[] = [
  {
    userID: 'admin',
    password: '123',
    userName: 'Nguyen Van A (Admin)',
    role: 'admin',
  },
  {
    userID: 'user01',
    password: '123',
    userName: 'Tran Thi B',
    role: 'user',
  },
  {
    userID: 'tanphat',
    password: '456',
    userName: 'Le Tan Phat',
    role: 'user',
  }
];