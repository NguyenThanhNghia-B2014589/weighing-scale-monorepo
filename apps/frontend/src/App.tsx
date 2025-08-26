// src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';

// Import Header và các trang
import Header from './components/ui/Header';
import LoginPage from './components/LoginPage/LoginPage';
import WeighingStation from './components/WeighingStation/WeighingStation';
import ProtectedRoute from './components/auth/ProtectedRoute'; // 1. Import ProtectedRoute
import AdminPage from './components/Admin/AdminPage';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

function App() {
  return (
    // Cấu trúc layout và CSS của bạn được giữ nguyên
    <div className="min-h-screen bg-sky-200 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-[70px]">
        <Routes>
          {/* Trang Login không cần bảo vệ */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* BỌC TUYẾN ĐƯỜNG WeighingStation BẰNG ProtectedRoute */}
          <Route 
            path="/WeighingStation" 
            element={
              <ProtectedRoute>
                <WeighingStation />
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

          {/* Tuyến đường mặc định vẫn giữ nguyên */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;