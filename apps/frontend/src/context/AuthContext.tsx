// src/context/AuthContext.tsx

import React, { createContext, useState, ReactNode } from 'react';

// --- ĐỊNH NGHĨA TYPES ---
interface User {
  userID: string;
  userName: string;
  role: string;
}

// 1. CẬP NHẬT AuthContextType
export interface AuthContextType {
  user: User | null;
  // Hàm login bây giờ sẽ nhận thêm một tham số là token
  login: (userData: User, token: string) => void; 
  logout: () => void;
}

// --- TẠO VÀ EXPORT CONTEXT ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export function AuthProvider({ children }: { children: ReactNode }) {
  
  // Khởi tạo state từ localStorage (giữ nguyên)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu người dùng từ localStorage", error);
      return null;
    }
  });

  // 2. CẬP NHẬT HÀM LOGIN
  const login = (userData: User, token: string) => {
    // Lưu cả token và thông tin người dùng vào localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    // Cập nhật state trong React
    setUser(userData);
  };

  // 3. CẬP NHẬT HÀM LOGOUT
  const logout = () => {
    // Xóa cả token và user
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Cập nhật state trong React
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;