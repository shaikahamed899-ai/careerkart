"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companiesApi, CompanyFilters, Review, InterviewExperience } from "../companies";

export const useCompanies = (filters: CompanyFilters = {}) => {
  return useQuery({
    queryKey: ["companies", filters],
    queryFn: async () => {
      const response = await companiesApi.getCompanies(filters);
      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || 1,
        totalPages: response.pagination?.totalPages || 1,
      };
    },
  });
};

export const useCompany = (idOrSlug: string) => {
  return useQuery({
    queryKey: ["company", idOrSlug],
    queryFn: async () => {
      const response = await companiesApi.getCompany(idOrSlug);
      return response.data;
    },
    enabled: !!idOrSlug,
  });
};

export const useCompanyJobs = (idOrSlug: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["companyJobs", idOrSlug, page, limit],
    queryFn: async () => {
      const response = await companiesApi.getCompanyJobs(idOrSlug, page, limit);
      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || 1,
      };
    },
    enabled: !!idOrSlug,
  });
};

export const useCompanyReviews = (idOrSlug: string, page = 1, limit = 10, sortBy = 'newest') => {
  return useQuery({
    queryKey: ["companyReviews", idOrSlug, page, limit, sortBy],
    queryFn: async () => {
      const response = await companiesApi.getCompanyReviews(idOrSlug, page, limit, sortBy);
      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || 1,
      };
    },
    enabled: !!idOrSlug,
  });
};

export const useCompanySalaries = (idOrSlug: string, page = 1, limit = 10, jobTitle?: string) => {
  return useQuery({
    queryKey: ["companySalaries", idOrSlug, page, limit, jobTitle],
    queryFn: async () => {
      const response = await companiesApi.getCompanySalaries(idOrSlug, page, limit, jobTitle);
      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
      };
    },
    enabled: !!idOrSlug,
  });
};

export const useCompanyInterviews = (idOrSlug: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["companyInterviews", idOrSlug, page, limit],
    queryFn: async () => {
      const response = await companiesApi.getCompanyInterviews(idOrSlug, page, limit);
      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
      };
    },
    enabled: !!idOrSlug,
  });
};

export const useToggleFollowCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyId: string) => {
      const response = await companiesApi.toggleFollow(companyId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ companyId, data }: { companyId: string; data: Partial<Review> }) => {
      const response = await companiesApi.submitReview(companyId, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companyReviews", variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ["company", variables.companyId] });
    },
  });
};

export const useSubmitInterview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ companyId, data }: { companyId: string; data: Partial<InterviewExperience> }) => {
      const response = await companiesApi.submitInterview(companyId, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companyInterviews", variables.companyId] });
    },
  });
};
