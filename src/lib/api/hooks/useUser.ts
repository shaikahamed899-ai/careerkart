"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, Education, Experience, Skill, ProfileUpdate, Preferences } from "../user";
import { useAuthStore } from "@/store/authStore";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await userApi.getProfile();
      return response.data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuthStore.getState();
  
  return useMutation({
    mutationFn: async (data: ProfileUpdate) => {
      const response = await userApi.updateProfile(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshUser();
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuthStore.getState();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await userApi.uploadAvatar(file);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshUser();
    },
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuthStore.getState();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await userApi.uploadResume(file);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshUser();
    },
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuthStore.getState();
  
  return useMutation({
    mutationFn: async () => {
      const response = await userApi.deleteResume();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refreshUser();
    },
  });
};

// Education hooks
export const useAddEducation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (education: Education) => {
      const response = await userApi.addEducation(education);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useUpdateEducation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, education }: { id: string; education: Education }) => {
      const response = await userApi.updateEducation(id, education);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useDeleteEducation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await userApi.deleteEducation(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Experience hooks
export const useAddExperience = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (experience: Experience) => {
      const response = await userApi.addExperience(experience);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, experience }: { id: string; experience: Experience }) => {
      const response = await userApi.updateExperience(id, experience);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await userApi.deleteExperience(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Skills hook
export const useUpdateSkills = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skills: Skill[]) => {
      const response = await userApi.updateSkills(skills);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Preferences hook
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preferences: Preferences) => {
      const response = await userApi.updatePreferences(preferences);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
