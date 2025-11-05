// src/components/LoginPage/LoginPage.tsx
import React from 'react';
import Notification from '../ui/Notification/Notification';
import Spinner from '../ui/Spinner/Spinner';
import { useLoginPage } from '../../hooks/useLoginPage';
import scaleGif from '../../assets/scale.gif';

function LoginPage() {
  const{
    setUserID,
    handleLogin,
    userID,
    isLoading,
    notificationMessage,
    notificationType,
  } = useLoginPage();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-200 p-4">
      <Notification message={notificationMessage} type={notificationType} />

      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        
        {/* Cột bên trái: Hiển thị ảnh GIF */}
        <div className="md:w-1/2">
          <img 
            src={scaleGif} 
            alt="Weighing Scale Animation" 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Cột bên phải: Form đăng nhập */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Đăng Nhập</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">Số thẻ (UserID)</label>
              <input
                id="userID"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Nhập số thẻ của bạn"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#00446e] text-white font-bold py-3 rounded-lg hover:bg-[#003a60] transition-colors disabled:bg-gray-400 disabled:cursor-wait flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : 'Đăng Nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;