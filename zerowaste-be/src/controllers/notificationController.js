import Notification from '../models/Notification.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// GET /api/v1/notifications - Get all notifications for logged-in user
export const getMyNotifications = catchAsync(async (req, res, next) => {
  const { unread_only } = req.query;

  const filter = { user_id: req.user._id };

  if (unread_only === 'true') {
    filter.is_read = false;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(100);

  const unreadCount = await Notification.countDocuments({
    user_id: req.user._id,
    is_read: false
  });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    unreadCount,
    data: {
      notifications
    }
  });
});

// PATCH /api/v1/notifications/:id/read - Mark single notification as read
export const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user_id: req.user._id
    },
    { is_read: true },
    { new: true, runValidators: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// PATCH /api/v1/notifications/read-all - Mark all notifications as read
export const markAllAsRead = catchAsync(async (req, res, next) => {
  const result = await Notification.updateMany(
    {
      user_id: req.user._id,
      is_read: false
    },
    { is_read: true }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} notifications marked as read`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// DELETE /api/v1/notifications/:id - Delete single notification
export const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user_id: req.user._id
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// DELETE /api/v1/notifications - Delete all notifications for user
export const deleteAllNotifications = catchAsync(async (req, res, next) => {
  const result = await Notification.deleteMany({
    user_id: req.user._id
  });

  res.status(200).json({
    status: 'success',
    message: `${result.deletedCount} notifications deleted`,
    data: {
      deletedCount: result.deletedCount
    }
  });
});

// Helper function to create notification (used by other controllers)
export const createNotification = async ({ user_id, title, body, type = 'info', related_data = null }) => {
  try {
    const notification = await Notification.create({
      user_id,
      title,
      body,
      type,
      related_data
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

export default {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification
};
