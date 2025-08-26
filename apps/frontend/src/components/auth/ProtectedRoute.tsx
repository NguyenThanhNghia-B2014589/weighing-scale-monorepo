// src/components/auth/ProtectedRoute.tsx

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

// Component này nhận một prop là "children", chính là trang mà nó đang bảo vệ
function ProtectedRoute({ children }: { children: ReactNode }) {
  // Lấy thông tin người dùng từ AuthContext
  const { user } = useAuth();

  // Kiểm tra: Nếu không có người dùng (chưa đăng nhập)
  if (!user) {
    // Chuyển hướng người dùng về trang /login
    // "replace" sẽ thay thế lịch sử duyệt web, ngăn người dùng nhấn "Back" để quay lại trang đã bảo vệ
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị trang được yêu cầu
  return <>{children}</>;
}

export default ProtectedRoute;