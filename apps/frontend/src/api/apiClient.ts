// src/api/apiClient.ts

import axios from 'axios';
import { API_BASE_URL } from '../config/apiconfig';

// Tạo một instance của Axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL, // Tất cả các request sẽ tự động có tiền tố này
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- PHẦN NÂNG CẤP QUAN TRỌNG ---
// Thêm một "request interceptor"
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage trước mỗi lần gửi request
    const token = localStorage.getItem('token');
    
    // Nếu có token, đính kèm nó vào header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; // Trả về config đã được cập nhật
  },
  (error) => {
    // Xử lý lỗi nếu có
    return Promise.reject(error);
  }
);

export default apiClient;