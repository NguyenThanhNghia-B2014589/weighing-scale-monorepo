import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import React from 'react';

// --- COMPONENT CON CHO CÁC ICON ĐIỀU HƯỚNG DESKTOP ---
function NavLink({ to, title, children }: { to: string; title: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} title={title} className={`relative px-3 py-2 transition-colors ${isActive ? '' : 'hover:text-sky-300'}`}>
      {children}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-sky-500 rounded-md z-0"
          layoutId="active-nav-link"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
    </Link>
  );
}
 export default NavLink;