import React from 'react';
import Notification from '../ui/Notification/Notification';
import Spinner from '../ui/Spinner/Spinner'; // Đảm bảo bạn đã có component này
import { useLoginPage } from '../../hooks/useLoginPage';
import scaleGif from '../../assets/scale.gif';

function LoginPage() {
  const{
    setUserID,
    setPassword,
    handleLogin,
    userID,
    password,
    isLoading,
    notificationMessage,
    notificationType,
  } = useLoginPage();
  return (
    // Container chính để căn giữa toàn bộ card
    <div className="min-h-screen flex items-center justify-center bg-sky-200 p-4">
      <Notification message={notificationMessage} type={notificationType} />

      {/* 2. CARD ĐĂNG NHẬP ĐÃ ĐƯỢC TÁI CẤU TRÚC */}
      {/* - flex-col: xếp chồng trên mobile */}
      {/* - md:flex-row: xếp hàng ngang trên desktop */}
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        
        {/* --- CỘT BÊN TRÁI: HIỂN THỊ ẢNH GIF --- */}
        {/* - md:w-1/2: chiếm 1/2 chiều rộng trên desktop */}
        <div className="md:w-1/2">
          <img 
            src={scaleGif} 
            alt="Weighing Scale Animation" 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* --- CỘT BÊN PHẢI: FORM ĐĂNG NHẬP --- */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Đăng Nhập</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">UserID</label>
              <input
                id="userID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Nhập UserID của bạn"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Mật khẩu</label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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