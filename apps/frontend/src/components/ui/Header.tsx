// src/components/ui/Header.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoIcon from '../../assets/logo.png';
import adminIcon from '../../assets/admin.png';
import logoutIcon from '../../assets/logout.png';
import { useAuth } from '../../hooks/useAuth';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // đóng menu khi logout
    navigate('/login');
  };

  // Click ra ngoài menu thì đóng
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset menu về false mỗi khi user thay đổi (login/logout)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [user]);

  return (
    <header className="fixed top-0 left-0 w-full h-[70px] bg-[#064469] z-50 flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center gap-4">
        <Link to="/WeighingStationNew" className="flex items-center gap-4">
          <img src={logoIcon} alt="Logo" className="h-[35px]" />
        </Link>
        <h1 className="text-white sm:text-2xl text-xl font-bold tracking-wide">
          LƯU TRÌNH CÂN KEO XƯỞNG ĐẾ
        </h1>
      </div>

      {user && (
        <div className="relative" ref={menuRef}>
          {/* Nút mở menu */}
          <div
            className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-white/10"
            onClick={toggleMenu}
          >
            <span className="text-white font-medium">{user.userName}</span>
            <span className="text-white">▼</span>
          </div>

          {/* Menu xổ xuống */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-xl p-2 z-50 ring-1 ring-black ring-opacity-5 flex flex-col gap-1">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="w-full text-left px-4 py-2 text-gray-800 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <img src={adminIcon} alt="Admin" className="h-5 w-5 mr-3" />
                  Trang Admin
                </Link>
              )}

              <button
                className="w-full text-left px-4 py-2 text-gray-800 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                onClick={handleLogout}
              >
                <img src={logoutIcon} alt="Đăng xuất" className="h-5 w-5 mr-3" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
