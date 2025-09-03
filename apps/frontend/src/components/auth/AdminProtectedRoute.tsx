// src/components/auth/AdminProtectedRoute.tsx

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // 1. Kiểm tra xem người dùng đã đăng nhập chưa. Nếu chưa, chuyển về trang login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Kiểm tra xem vai trò của người dùng có phải là 'admin' không.
  // Nếu không phải, chuyển họ về trang chủ (WeighingStation).
  if (user.role !== 'admin') {
    return <Navigate to="/WeighingStation" replace />;
  }

  // 3. Nếu tất cả các điều kiện đều thỏa mãn, cho phép hiển thị trang.
  return <>{children}</>;
}

export default AdminProtectedRoute;