"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employerApi, CreateJobData, ScheduleInterviewData } from "../employer";

// Dashboard
export const useDashboard = () => {
  return useQuery({
    queryKey: ["employer", "dashboard"],
    queryFn: async () => {
      const response = await employerApi.getDashboard();
      return response.data;
    },
  });
};

// Company
export const useMyCompany = () => {
  return useQuery({
    queryKey: ["employer", "company"],
    queryFn: async () => {
      const response = await employerApi.getMyCompany();
      return response.data;
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof employerApi.createCompany>[0]) => {
      return employerApi.createCompany(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "company"] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof employerApi.updateCompany>[0]) => {
      return employerApi.updateCompany(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "company"] });
    },
  });
};

// Jobs
export const useMyJobs = (page = 1, limit = 20, status?: string) => {
  return useQuery({
    queryKey: ["employer", "jobs", page, limit, status],
    queryFn: async () => {
      const response = await employerApi.getMyJobs(page, limit, status);
      return response.data || [];
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobData) => {
      return employerApi.createJob(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: Partial<CreateJobData> }) => {
      return employerApi.updateJob(jobId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
    },
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      // Use updateJob to change status
      return employerApi.updateJob(jobId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      return employerApi.deleteJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });
};

// Applications
export const useAllApplications = (page = 1, limit = 20, status?: string, jobId?: string, sortBy?: 'newest' | 'oldest' | 'match_score') => {
  return useQuery({
    queryKey: ["employer", "applications", page, limit, status, jobId, sortBy],
    queryFn: async () => {
      const response = await employerApi.getAllApplications(page, limit, status, sortBy);
      return response.data || [];
    },
  });
};

export const useJobApplications = (jobId: string, page = 1, limit = 20, status?: string) => {
  return useQuery({
    queryKey: ["employer", "applications", jobId, page, limit, status],
    queryFn: async () => {
      const response = await employerApi.getJobApplications(jobId, page, limit, status);
      return response.data || [];
    },
    enabled: !!jobId,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, status, notes }: { applicationId: string; status: string; notes?: string }) => {
      return employerApi.updateApplicationStatus(applicationId, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["employer", "dashboard"] });
    },
  });
};

export const useScheduleInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, data }: { applicationId: string; data: ScheduleInterviewData }) => {
      return employerApi.scheduleInterview(applicationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer", "applications"] });
    },
  });
};

// Analytics
export const useAnalytics = (days = 30) => {
  return useQuery({
    queryKey: ["employer", "analytics", days],
    queryFn: async () => {
      const response = await employerApi.getAnalytics(days);
      return response.data;
    },
  });
};
