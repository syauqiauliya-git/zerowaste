import express from 'express';
import userController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user profile endpoints require authentication
router.use(protect);

// GET /api/v1/users/me - Get current user profile (read)
router.get('/me', userController.getMe);

// PUT /api/v1/users/update-me - Update user data (write)
router.put('/update-me', userController.updateMe);

// NOTE: Password change logic would go here, but is a separate feature.

export default router;