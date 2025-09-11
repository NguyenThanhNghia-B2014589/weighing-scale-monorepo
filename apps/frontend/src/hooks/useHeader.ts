import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';


export function useHeader (){

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
    
    // Biến chứa các lớp CSS chung cho link trong dropdown
    const dropdownLinkClasses = "w-full text-left px-4 py-2 text-gray-800 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-3";

    return{
        isMenuOpen,
        dropdownLinkClasses,
        user,
        menuRef,
        toggleMenu,
        handleLogout,
    };
}