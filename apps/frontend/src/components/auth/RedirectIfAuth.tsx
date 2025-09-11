// src/components/auth/RedirectIfAuth.tsx

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Component này nhận prop "children", chính là LoginPage
function RedirectIfAuth({ children }: { children: ReactNode }) {
  // Lấy thông tin người dùng từ AuthContext
  const { user } = useAuth();

  // Kiểm tra: Nếu CÓ người dùng (đã đăng nhập)
  if (user) {
    // Chuyển hướng người dùng về trang chính
    return <Navigate to="/WeighingStationNew" replace />;
  }

  // Nếu chưa đăng nhập, cho phép hiển thị trang được yêu cầu (LoginPage)
  return <>{children}</>;
}

export default RedirectIfAuth;