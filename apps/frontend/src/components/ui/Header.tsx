// src/components/ui/Header.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import  NavLink  from './NavLink/NavLink';
import { useHeader } from '../../hooks/useHeader';


import logoIcon from '../../assets/logo.png';
import logoutIcon from '../../assets/logout.png';
import homeIcon from '../../assets/home.svg';
import gridPenIcon from '../../assets/grid_pen.svg';
import controlPanelIcon from '../../assets/control_panel.svg';


function Header() {
  const {
    isMenuOpen,
    dropdownLinkClasses,
    user,
    menuRef,
    toggleMenu,
    handleLogout,
  } = useHeader();

  return (
    <header className="fixed top-0 left-0 w-full h-[70px] bg-[#064469] z-50 flex items-center justify-between px-6 shadow-lg">
      <Link to="/WeighingStationNew" className="flex items-center gap-4">
        <img src={logoIcon} alt="Logo" className="h-[35px]" />
        <h1 className="text-white text-2xl font-bold tracking-wide">LƯU TRÌNH CÂN KEO XƯỞNG ĐẾ</h1>
      </Link>

      {user && (
        <div className="flex items-center gap-6">
          {/* 1. KHU VỰC NAV CHO DESKTOP: Ẩn trên mobile */}
          <nav className="hidden md:flex items-center gap-1 relative">
            <NavLink to="/WeighingStationNew" title="Trạm Cân">
              <span className="relative z-10">
                <img src={homeIcon} alt="Trang chủ" className="h-6 w-6 brightness-0 invert" />
              </span>
            </NavLink>
            {user.role === 'admin' && (
              <>
                <NavLink to="/dashboard" title="Dashboard">
                  <span className="relative z-10">
                    <img src={controlPanelIcon} alt="Dashboard" className="h-6 w-6 brightness-0 invert" />
                  </span>
                </NavLink>
                <NavLink to="/admin" title="Lịch sử cân">
                  <span className="relative z-10">
                    <img src={gridPenIcon} alt="Lịch sử cân" className="h-6 w-6 brightness-0 invert" />
                  </span>
                </NavLink>
              </>
            )}
          </nav>

          {/* KHU VỰC TÊN NGƯỜI DÙNG VÀ DROPDOWN */}
          <div className="relative" ref={menuRef}>
            <div className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-white/10" onClick={toggleMenu}>
              <span className="text-white font-medium">{user.userName}</span>
              <span className="text-white text-xs">▼</span>
            </div>

            {isMenuOpen && (
              // Tăng chiều rộng dropdown để chứa text
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-xl p-2 z-50 ring-1 ring-black ring-opacity-5">
                
                {/* 2. CÁC LINK NAV CHO MOBILE: Chỉ hiện trên mobile */}
                <div className="md:hidden">
                  <Link to="/WeighingStationNew" className={dropdownLinkClasses} onClick={toggleMenu}>
                    <img src={homeIcon} alt="Trang chủ" className="h-5 w-5 filters invert" />
                    Trạm Cân
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin" className={dropdownLinkClasses} onClick={toggleMenu}>
                        <img src={gridPenIcon} alt="Lịch sử" className="h-5 w-5 filters invert" />
                        Lịch Sử Cân
                      </Link>
                      <Link to="/dashboard" className={dropdownLinkClasses} onClick={toggleMenu}>
                        <img src={controlPanelIcon} alt="Dashboard" className="h-5 w-5 filters invert" />
                        Dashboard
                      </Link>
                    </>
                  )}
                  {/* Đường kẻ phân cách */}
                  <hr className="my-1 border-gray-200" />
                </div>
                
                {/* Nút Đăng xuất (luôn hiển thị trong dropdown) */}
                <button 
                  className={dropdownLinkClasses}
                  onClick={handleLogout}
                >
                  <img src={logoutIcon} alt="Đăng xuất" className="h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;