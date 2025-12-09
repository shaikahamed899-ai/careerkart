import { apiClient } from './client';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  relatedJob?: {
    _id: string;
    title: string;
  };
  relatedCompany?: {
    _id: string;
    name: string;
    logo?: { url: string };
  };
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: async (page = 1, limit = 20, type?: string, unreadOnly = false) => {
    return apiClient.get<Notification[]>('/notifications', {
      page,
      limit,
      type,
      unreadOnly,
    });
  },

  getUnreadCount: async () => {
    return apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
  },

  markAsRead: async (notificationId: string) => {
    return apiClient.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.put('/notifications/read-all');
  },

  deleteNotification: async (notificationId: string) => {
    return apiClient.delete(`/notifications/${notificationId}`);
  },

  deleteAllNotifications: async () => {
    return apiClient.delete('/notifications');
  },

  updatePreferences: async (preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  }) => {
    return apiClient.put('/notifications/preferences', preferences);
  },
};
