// src/api/routes/syncRoutes.ts
import express from 'express';
import { getUnweighedSummary } from '../controllers/unweighedController';

const router = express.Router();

// Định nghĩa API GET /api//unweighed/summary
router.get('/unweighed/summary', getUnweighedSummary);

export default router;