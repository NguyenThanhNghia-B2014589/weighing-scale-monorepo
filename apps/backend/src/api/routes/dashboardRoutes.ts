// apps/backend/src/api/routes/dashboardRoutes.ts
import express from 'express';
import { 
  getInventorySummary, 
  getHourlyWeighing, 
  getWeighingTrend 
} from '../controllers/dashboardController';

const router = express.Router();

// GET /api/dashboard/inventory-summary - Lấy tổng quan tồn kho
router.get('/dashboard/inventory-summary', getInventorySummary);

// GET /api/dashboard/hourly-weighing - Lấy dữ liệu cân theo giờ
router.get('/dashboard/hourly-weighing', getHourlyWeighing);

// GET /api/dashboard/weighing-trend - Lấy xu hướng cân theo tháng
router.get('/dashboard/weighing-trend', getWeighingTrend);

export default router;