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

export default apiClient;