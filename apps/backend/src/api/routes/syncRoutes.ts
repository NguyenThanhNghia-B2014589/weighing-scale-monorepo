// src/api/routes/syncRoutes.ts
import express from 'express';
import { getUnweighedData } from '../controllers/syncController';

const router = express.Router();

// Định nghĩa API GET /api/sync/unweighed
router.get('/sync/unweighed', getUnweighedData);

export default router;