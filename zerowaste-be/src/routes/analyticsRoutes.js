import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/school', restrictTo('teacher', 'admin'), analyticsController.getSchoolAnalytics);
router.get('/global', restrictTo('admin'), analyticsController.getGlobalAnalytics);
router.get('/leaderboard', restrictTo('teacher', 'admin'), analyticsController.getLeaderboard);

export default router;
