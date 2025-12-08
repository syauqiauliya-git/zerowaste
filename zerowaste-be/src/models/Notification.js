import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required']
  },
  body: {
    type: String,
    required: [true, 'Notification body is required']
  },
  type: {
    type: String,
    enum: ['success', 'info', 'warning', 'error'],
    default: 'info'
  },
  is_read: {
    type: Boolean,
    default: false
  },
  related_data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, is_read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
