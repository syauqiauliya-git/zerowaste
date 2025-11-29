import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import classAnalyticsController from '../controllers/classAnalyticsController.js';

const router = express.Router();

router.use(protect);
router.get('/:classId', restrictTo('teacher', 'admin'), classAnalyticsController.getClassAnalytics);

export default router;
