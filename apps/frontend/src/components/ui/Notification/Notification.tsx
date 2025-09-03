// src/components/Notification.tsx

import { motion, AnimatePresence } from 'framer-motion';

// Định nghĩa props cho component
interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

function Notification({ message, type }: NotificationProps) {
  // --- PHẦN GIAO DIỆN ---
  const bgColor = type === 'success' ? 'bg-[#90D080FF]' : 'bg-[#F95E16FF]';
  const icon = type === 'success' 
    ? (
      <svg className="h-16 w-16 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
    : (
      <svg className="h-16 w-16 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );

  return (
    // AnimatePresence cho phép component con có animation "exit" (biến mất)
    <AnimatePresence>
      {/* Chỉ render component khi có message */}
      {message && (
        // Thay <div> bằng <motion.div> và thêm các thuộc tính animation
        <motion.div
          className={`fixed top-1/2 left-1/2 p-10 rounded-xl text-white font-bold text-center shadow-lg z-50 flex flex-col items-center justify-center min-w-[300px] ${bgColor}`}
          // Trạng thái ban đầu (trước khi xuất hiện)
          initial={{ opacity: 0, y: -50, x: "-50%" }} 
          // Trạng thái khi xuất hiện
          animate={{ opacity: 1, y: "-50%", x: "-50%" }}
          // Trạng thái khi biến mất
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
          // Tùy chỉnh hiệu ứng
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        >
          {icon}
          <span className="text-2xl">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default Notification;