import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/school', restrictTo('teacher', 'admin'), analyticsController.getSchoolAnalytics);
router.get('/school/:id', restrictTo('admin'), analyticsController.getSchoolAnalyticsById);
router.get('/class', restrictTo('teacher', 'admin'), analyticsController.getClassAnalytics);
router.get('/class/:id', restrictTo('admin'), analyticsController.getClassAnalyticsById);
router.get('/global', restrictTo('admin'), analyticsController.getGlobalAnalytics);
router.get('/leaderboard', restrictTo('teacher', 'admin'), analyticsController.getLeaderboard);
router.get('/sppg', restrictTo('admin', 'sppg_staff'), analyticsController.getSppgAnalytics);
router.get('/sppg/:id', restrictTo('admin'), analyticsController.getSppgAnalyticsById);

export default router;
