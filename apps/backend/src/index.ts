import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/routes/authRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server đang chạy trên cổng ${PORT}`);
});