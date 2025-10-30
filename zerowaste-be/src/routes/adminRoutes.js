import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import adminController from '../controllers/adminController.js';

const router = express.Router();

// ALL ROUTES IN THIS FILE ARE RESTRICTED TO ADMIN
router.use(protect, restrictTo('admin'));

// GET /api/v1/admin/profiles/pending (Review Dashboard)
router.get('/profiles/pending', adminController.getPendingProfiles);

// PUT /api/v1/admin/profiles/:id/approve (Approval Action)
router.put('/profiles/:id/approve', adminController.approveProfile);

// PUT /api/v1/admin/profiles/:id/reject (Rejection Action)
router.put('/profiles/:id/reject', adminController.rejectProfile);

export default router;