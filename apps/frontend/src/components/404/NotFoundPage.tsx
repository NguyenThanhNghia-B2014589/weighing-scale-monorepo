// src/components/NotFoundPage/NotFoundPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, useMotionValue, useTransform, animate, Variants } from 'framer-motion';

function NotFoundPage() {
  const { user } = useAuth();
  const homePath = user ? "/WeighingStationNew" : "/login";

  // --- LOGIC CHO HIỆU ỨNG BÓNG ĐỔ THEO CHUỘT ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Tạo ra các giá trị transform dựa trên vị trí của chuột
  // rotateY sẽ xoay từ -10deg đến 10deg, rotateX sẽ xoay từ 10deg đến -10deg
  const rotateX = useTransform(y, [-1, 1], [10, -10]);
  const rotateY = useTransform(x, [-1, 1], [-10, -10]);

  // Hàm được gọi khi chuột di chuyển trên container
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Tính toán vị trí của chuột (từ -1 đến 1) so với trung tâm của div
    x.set((event.clientX - rect.left - rect.width / 2) / (rect.width / 2));
    y.set((event.clientY - rect.top - rect.height / 2) / (rect.height / 2));
  };
  
  // Hàm reset khi chuột rời khỏi container
  const handleMouseLeave = () => {
    animate(x, 0, { duration: 0.5 });
    animate(y, 0, { duration: 0.5 });
  };

  // --- VARIANTS CHO ANIMATION SỐ 404 ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const numberVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 10 },
    },
  }

  return (
    <div 
      className="flex flex-col items-center justify-center h-screen bg-sky-200 text-center px-4 overflow-hidden"
      style={{ perspective: 800 }} // Cần thiết để có hiệu ứng 3D
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Container cho hiệu ứng 3D */}
      <motion.div style={{ rotateX, rotateY, x, y }}>
        {/* Số 404 với animation */}
        <motion.h1
          className="text-9xl font-black text-sky-400 flex"
          style={{ textShadow: '10px 10px 20px rgba(0,0,0,0.2)' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={numberVariants}>4</motion.span>
          <motion.span variants={numberVariants}>0</motion.span>
          <motion.span variants={numberVariants}>4</motion.span>
        </motion.h1>
      </motion.div>

      <motion.p 
        className="text-2xl md:text-3xl font-bold text-gray-700 mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Oops! Không tìm thấy trang.
      </motion.p>
      
      <motion.p 
        className="text-gray-500 mt-2 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </motion.p>

      {/* Nút bấm với hiệu ứng rung lắc */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: [0, -2, 2, -2, 2, 0] }} // Rung lắc
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to={homePath}
          className="px-6 py-3 bg-[#00446e] text-white font-semibold rounded-lg hover:bg-[#003a60] transition-colors shadow-lg"
        >
          Quay về Trang Chủ
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;