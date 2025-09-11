import React, { useState } from 'react';
import  {useAuth} from './useAuth';
import { useNotification } from './useNotification';
import { mockUsers } from '../data/users';
import { useNavigate } from 'react-router-dom';


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
  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true); // 2. Bật loading

    setTimeout(() => {
      const foundUser = mockUsers.find(
        (user) => user.userID === userID && user.password === password
      );

      if (foundUser) {
        showNotification(`Chào mừng ${foundUser.userName}!`, 'success');
        login(foundUser);
        setTimeout(() => navigate('/WeighingStationNew'), 1500);
      } else {
        showNotification('UserID hoặc mật khẩu không đúng!', 'error');
      }
      setIsLoading(false); // 3. Tắt loading
    }, 1500);
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