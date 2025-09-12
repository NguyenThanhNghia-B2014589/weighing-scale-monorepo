import React, { useState } from 'react';
import  {useAuth} from './useAuth';
import { useNotification } from './useNotification';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../api/apiClient';


export function useLoginPage(){
  // --- STATE ---
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const { showNotification, notificationMessage, notificationType } = useNotification();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // 1. Thêm state isLoading
  const [isLoading, setIsLoading] = useState(false);

  // --- HÀM XỬ LÝ ---
  // HÀM NÀY THÀNH ASYNC VÀ GỌI API
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Gửi yêu cầu POST đến backend
      const response = await apiClient.post('/auth/login', {
        userID: userID,
        password: password,
      });
      
      // Nếu thành công (status code 2xx), response.data sẽ chứa token và user
      const { token, user } = response.data;
      
      // Gọi hàm login từ AuthContext để lưu thông tin
      login(user, token); // Chúng ta sẽ cập nhật hàm login ở bước sau
      
      showNotification(`Chào mừng ${user.userName}!`, 'success');
      
      setTimeout(() => {
        navigate('/WeighingStationNew');
      }, 1500);

    } catch (error) {
      // Nếu backend trả về lỗi (status code 4xx, 5xx)
      if (axios.isAxiosError(error) && error.response) {
        // Hiển thị thông báo lỗi từ backend
        showNotification(error.response.data.message || 'Đã có lỗi xảy ra', 'error');
      } else {
        // Lỗi mạng hoặc lỗi không xác định
        showNotification('Không thể kết nối đến server.', 'error');
      }
    } finally {
      // Luôn luôn dừng loading sau khi hoàn tất
      setIsLoading(false);
    }
  };
  return {
    setUserID,
    setPassword,
    setIsLoading,
    handleLogin,
    isLoading,
    notificationMessage,
    notificationType,
    userID,
    password,
  };
}