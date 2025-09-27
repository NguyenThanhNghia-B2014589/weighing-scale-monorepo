// apps/backend/src/api/routes/historyRoutes.ts
import { Router } from 'express';
import { getWeighingHistory } from '../controllers/historyController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

// Áp dụng authMiddleware để bảo vệ route này
router.get('/', authMiddleware, getWeighingHistory);

export default router;