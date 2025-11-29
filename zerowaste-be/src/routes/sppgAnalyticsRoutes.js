import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import sppgAnalyticsController from '../controllers/sppgAnalyticsController.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/:sppgId', sppgAnalyticsController.getSPPGAnalytics);

export default router;
