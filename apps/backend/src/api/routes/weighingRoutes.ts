// src/api/routes/weighingRoutes.ts
import express from 'express';
import { completeWeighing } from '../controllers/weighingController';

const router = express.Router();

// Định nghĩa API 'Hoàn tất'
router.post('/complete', completeWeighing);

export default router;