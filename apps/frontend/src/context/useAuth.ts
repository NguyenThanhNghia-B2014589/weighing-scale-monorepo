// src/context/useAuth.ts

import { useContext } from 'react';
import AuthContext from './AuthContext';

// Custom Hook để dễ dàng sử dụng Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}