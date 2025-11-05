import express from 'express';
import { login } from '../controllers/authController';

const router = express.Router();

// Định nghĩa API POST /api/auth/login
router.post('/login', login);

export default router;