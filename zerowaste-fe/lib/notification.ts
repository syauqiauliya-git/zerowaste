import { apiFetch } from './api';

export interface Notification {
  _id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'success' | 'info' | 'warning' | 'error';
  is_read: boolean;
  related_data?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  status: string;
  results: number;
  unreadCount: number;
  data: {
    notifications: Notification[];
  };
}

export interface MarkAsReadResponse {
  status: string;
  data: {
    notification: Notification;
  };
}

export interface MarkAllAsReadResponse {
  status: string;
  message: string;
  data: {
    modifiedCount: number;
  };
}

export interface DeleteNotificationResponse {
  status: string;
  data: null;
}

// Get all notifications for logged-in user
export const fetchNotifications = async (unreadOnly: boolean = false): Promise<NotificationsResponse> => {
  const queryString = unreadOnly ? '?unread_only=true' : '';
  return await apiFetch<NotificationsResponse>(`/api/v1/notifications${queryString}`);
};

// Mark single notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<MarkAsReadResponse> => {
  return await apiFetch<MarkAsReadResponse>(`/api/v1/notifications/${notificationId}/read`, {
    method: 'PATCH'
  });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<MarkAllAsReadResponse> => {
  return await apiFetch<MarkAllAsReadResponse>('/api/v1/notifications/read-all', {
    method: 'PATCH'
  });
};

// Delete single notification
export const deleteNotification = async (notificationId: string): Promise<DeleteNotificationResponse> => {
  return await apiFetch<DeleteNotificationResponse>(`/api/v1/notifications/${notificationId}`, {
    method: 'DELETE'
  });
};

// Delete all notifications
export const deleteAllNotifications = async (): Promise<{ status: string; message: string; data: { deletedCount: number } }> => {
  return await apiFetch<{ status: string; message: string; data: { deletedCount: number } }>('/api/v1/notifications', {
    method: 'DELETE'
  });
};

// Get unread count only
export const fetchUnreadCount = async (): Promise<number> => {
  const response = await fetchNotifications(true);
  return response.unreadCount;
};
