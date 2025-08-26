// src/components/layouts/AppLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui/Header';

function AppLayout() {
  return (
    // Đây là layout chung cho TOÀN BỘ ứng dụng
    <div className="min-h-screen bg-sky-200 flex flex-col pt-[70px]">
      <Header />
      
      {/* Thẻ <main> sẽ chiếm toàn bộ không gian còn lại */}
      {/* <Outlet /> là nơi các trang (LoginPage, WeighingStation) sẽ được render */}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;