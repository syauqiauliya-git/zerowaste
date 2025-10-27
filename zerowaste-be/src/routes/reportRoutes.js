import express from 'express';
import reportController from '../controllers/reportController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply security and role restriction for all report routes
router.use(protect, restrictTo('teacher'));

router.route('/')
  .post(reportController.createReport) // POST /api/v1/reports (Submission)
  .get(reportController.getAllReports); // GET /api/v1/reports (Retrieval)

export default router;