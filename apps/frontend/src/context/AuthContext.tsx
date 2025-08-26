// src/context/AuthContext.tsx

import React, { createContext, useState, ReactNode } from 'react';

// --- ĐỊNH NGHĨA TYPES (giữ nguyên) ---
interface User {
  userID: string;
  userName: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// --- TẠO VÀ EXPORT CONTEXT (giữ nguyên) ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT (ĐÃ ĐƯỢC NÂNG CẤP) ---
export function AuthProvider({ children }: { children: ReactNode }) {
  
  // 1. KHỞI TẠO STATE TỪ LOCALSTORAGE
  // useState sẽ chạy hàm này một lần duy nhất khi component khởi tạo
  const [user, setUser] = useState<User | null>(() => {
    try {
      // Lấy dữ liệu người dùng đã lưu từ localStorage
      const storedUser = localStorage.getItem('user');
      // Nếu có, chuyển chuỗi JSON trở lại thành object. Nếu không, trả về null.
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu người dùng từ localStorage", error);
      return null;
    }
  });

  // 2. CẬP NHẬT HÀM LOGIN ĐỂ LƯU VÀO LOCALSTORAGE
  const login = (userData: User) => {
    // Chuyển object người dùng thành một chuỗi JSON để lưu trữ
    localStorage.setItem('user', JSON.stringify(userData));
    // Cập nhật state trong React
    setUser(userData);
  };

  // 3. CẬP NHẬT HÀM LOGOUT ĐỂ XÓA KHỎI LOCALSTORAGE
  const logout = () => {
    // Xóa mục 'user' khỏi localStorage
    localStorage.removeItem('user');
    // Cập nhật state trong React về null
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;