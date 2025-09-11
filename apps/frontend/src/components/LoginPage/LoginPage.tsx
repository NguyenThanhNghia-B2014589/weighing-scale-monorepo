import React from 'react';
import Notification from '../ui/Notification/Notification';
import Spinner from '../ui/Spinner/Spinner'; // Đảm bảo bạn đã có component này
import { useLoginPage } from '../../hooks/useLoginPage';

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
    <div className="min-h-auto flex items-center justify-center bg-sky-200 pt-[200px]">
      {/* Hiển thị thông báo nếu có */}
      <Notification message={notificationMessage} type={notificationType} />
      {/*Lớp phủ mờ khi có thông báo*/}
      {notificationMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40"></div>
      )}
      
      <div className={notificationMessage ? 'pointer-events-none opacity-50' : ''}></div>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Đăng Nhập</h2>
        <form onSubmit={handleLogin}>
          {/* --- Ô nhập UserID --- */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              UserID
            </label>
            <input
              id="userID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Nhập UserID của bạn"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              required
              disabled={isLoading} // 4. Vô hiệu hóa khi loading
            />
          </div>

          {/* --- Ô nhập Mật khẩu --- */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading} // 4. Vô hiệu hóa khi loading
            />
          </div>

          {/* --- Nút Đăng nhập --- */}
          <button
            type="submit"
            className="w-full bg-[#00446e] text-white font-bold py-3 rounded-lg hover:bg-[#003a60] transition-colors disabled:bg-[#003a60] disabled:cursor-wait flex items-center justify-center"
            disabled={isLoading} // 5. Vô hiệu hóa nút và thay đổi giao diện
          >
            {isLoading ? <Spinner size="sm" /> : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;