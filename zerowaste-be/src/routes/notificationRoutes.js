import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/v1/notifications - Get my notifications
router.get('/', getMyNotifications);

// PATCH /api/v1/notifications/read-all - Mark all as read
router.patch('/read-all', markAllAsRead);

// PATCH /api/v1/notifications/:id/read - Mark single as read
router.patch('/:id/read', markAsRead);

// DELETE /api/v1/notifications - Delete all notifications
router.delete('/', deleteAllNotifications);

// DELETE /api/v1/notifications/:id - Delete single notification
router.delete('/:id', deleteNotification);

export default router;
