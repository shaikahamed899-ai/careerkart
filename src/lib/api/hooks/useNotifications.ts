"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../notifications";

export const useNotifications = (page = 1, limit = 20, type?: string, unreadOnly = false) => {
  return useQuery({
    queryKey: ["notifications", page, limit, type, unreadOnly],
    queryFn: async () => {
      const response = await notificationsApi.getNotifications(page, limit, type, unreadOnly);
      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || 1,
      };
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadCount();
      return response.data?.unreadCount || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      return notificationsApi.markAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return notificationsApi.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      return notificationsApi.deleteNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
  });
};
