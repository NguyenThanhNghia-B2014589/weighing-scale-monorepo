// src/context/AuthContext.tsx

import React, { createContext, useState, ReactNode } from 'react';

// --- ĐỊNH NGHĨA TYPES ---
interface User {
  userID: string;
  userName: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User, token?: string) => void; 
  logout: () => void;
}

// --- TẠO VÀ EXPORT CONTEXT ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export function AuthProvider({ children }: { children: ReactNode }) {
  
  // Khởi tạo state từ localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu người dùng từ localStorage", error);
      return null;
    }
  });

  const login = (userData: User, token?: string) => {
    // Lưu token nếu có (optional)
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;