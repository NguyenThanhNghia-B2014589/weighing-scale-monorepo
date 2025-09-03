// src/components/layouts/AppLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../ui/Header';

function AppLayout() {
  return (
    // Đây là layout chung cho TOÀN BỘ ứng dụng
    <div className="h-screen bg-sky-200 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;