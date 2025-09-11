// src/App.tsx

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


function App() {
  return (
    // Cấu trúc layout và CSS của bạn được giữ nguyên
    <div className="min-h-screen bg-sky-200 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-[70px]">
        <Routes>
          {/* Trang Login không cần bảo vệ */}
          <Route 
            path="/login" 
            element={
                <LoginPage />
            } 
          />
          
          {/* BỌC TUYẾN ĐƯỜNG WeighingStation BẰNG ProtectedRoute */}
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
          
          {/* BỌC TUYẾN ĐƯỜNG AdminPage BẰNG ProtectedRoute */}
          <Route 
            path="/admin" 
            element={
              <AdminProtectedRoute>
                <AdminPage />
              </AdminProtectedRoute>
            }>  
          </Route>

          {/* */}
          <Route 
            path="/dashboard" 
            element={
              <AdminProtectedRoute>
                <DashboardPage />
              </AdminProtectedRoute>
            }>  
          </Route>
          
          {/* Tuyến đường mặc định */}
          <Route path="/" element={<Navigate to="/WeighingStationNew" replace />} />

          {/* 2. TUYẾN ĐƯỜNG CATCH-ALL đặt ở cuối cùng */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;