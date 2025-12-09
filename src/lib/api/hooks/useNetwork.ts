"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { networkApi } from "../network";

export const useConnections = (page = 1, limit = 20, status = "accepted") => {
  return useQuery({
    queryKey: ["connections", page, limit, status],
    queryFn: async () => {
      const response = await networkApi.getConnections(page, limit, status);
      return response.data || [];
    },
  });
};

export const usePendingRequests = (page = 1, limit = 20, type: "received" | "sent" = "received") => {
  return useQuery({
    queryKey: ["connectionRequests", page, limit, type],
    queryFn: async () => {
      const response = await networkApi.getPendingRequests(page, limit, type);
      return response.data || [];
    },
  });
};

export const useSuggestions = (limit = 10) => {
  return useQuery({
    queryKey: ["suggestions", limit],
    queryFn: async () => {
      const response = await networkApi.getSuggestions(limit);
      return response.data || [];
    },
  });
};

export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message?: string }) => {
      return networkApi.sendConnectionRequest(userId, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });
};

export const useAcceptConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      return networkApi.acceptConnection(connectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
    },
  });
};

export const useRejectConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      return networkApi.rejectConnection(connectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
    },
  });
};

export const useRemoveConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return networkApi.removeConnection(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
};
