// src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Header và các trang
import Header from './components/ui/Header';
import LoginPage from './components/LoginPage/LoginPage';
import WeighingStation from './components/WeighingStation/WeighingStation';
import WeighingStationNew from './components/WeighingStation/WeighingStationNew';
import DashboardPage from './components/DashBoard/DashBoard';
import AdminPage from './components/Admin/AdminPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import NotFoundPage from './components/404/NotFoundPage';
import SettingsModal from './components/ui/SettingsModal/SettingsModal'; // <-- path sửa
import { useAdminPageLogic } from './hooks/useAdminPage';

function App() {
  const {
    refreshData,
    formatLastRefresh,
    isAutoRefresh,
    setIsAutoRefresh,
  } = useAdminPageLogic();

  return (
    <div className="min-h-screen bg-sky-200 flex flex-col">
      <Header />

      {/* SettingsModal đặt ngoài <Routes> */}
      <SettingsModal
        isAutoRefresh={isAutoRefresh}
        setIsAutoRefresh={setIsAutoRefresh}
        refreshData={refreshData}
        formatLastRefresh={formatLastRefresh}
      />

      <main className="flex-grow pt-[70px]">
        <Routes>
          {/* Trang Login không cần bảo vệ */}
          <Route path="/login" element={<LoginPage />} />

          {/* WeighingStation (bọc ProtectedRoute) */}
          <Route
            path="/WeighingStation"
            element={
              <ProtectedRoute>
                <WeighingStation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/WeighingStationNew"
            element={
              <ProtectedRoute>
                <WeighingStationNew />
              </ProtectedRoute>
            }
          />

          {/* Admin page (bọc AdminProtectedRoute) */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <AdminProtectedRoute>
                <DashboardPage />
              </AdminProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="/" element={<Navigate to="/WeighingStationNew" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
