"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi, JobFilters as ApiJobFilters, Job } from "../jobs";

export interface UseJobsFilters {
  page?: number;
  limit?: number;
  search?: string;
  employmentType?: string | string[];
  workMode?: string | string[];
  location?: string;
  industry?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  sortBy?: 'newest' | 'oldest' | 'salary_high' | 'salary_low' | 'relevance';
}

export const useJobs = (filters: UseJobsFilters = {}) => {
  const { page = 1, limit = 10, ...restFilters } = filters;
  
  return useQuery({
    queryKey: ["jobs", page, limit, restFilters],
    queryFn: async () => {
      const response = await jobsApi.getJobs({ page, limit, ...restFilters });
      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || 1,
        hasNextPage: response.pagination?.hasNextPage || false,
      };
    },
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const response = await jobsApi.getJob(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useJobFilters = () => {
  return useQuery({
    queryKey: ["jobFilters"],
    queryFn: async () => {
      const response = await jobsApi.getFilterOptions();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useRecommendedJobs = (limit = 10) => {
  return useQuery({
    queryKey: ["recommendedJobs", limit],
    queryFn: async () => {
      const response = await jobsApi.getRecommendedJobs(limit);
      return response.data || [];
    },
  });
};

export const useMyApplications = (page = 1, limit = 10, status?: string) => {
  return useQuery({
    queryKey: ["myApplications", page, limit, status],
    queryFn: async () => {
      const response = await jobsApi.getMyApplications(page, limit, status);
      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || 1,
      };
    },
  });
};

export const useApplyJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: string; coverLetter?: string }) => {
      const response = await jobsApi.applyForJob(jobId, { coverLetter });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await jobsApi.toggleSaveJob(jobId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
    },
  });
};

export const useSavedJobs = () => {
  return useQuery({
    queryKey: ["savedJobs"],
    queryFn: async () => {
      const response = await jobsApi.getSavedJobs();
      return response.data || [];
    },
  });
};
