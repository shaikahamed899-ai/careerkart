"use client";

import { useQuery } from "@tanstack/react-query";
import { getMockJobs, getMockJobById } from "../mock/jobs";
import { JobFilters } from "@/types";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useJobs = (page: number = 1, pageSize: number = 10, filters?: JobFilters) => {
  return useQuery({
    queryKey: ["jobs", page, pageSize, filters],
    queryFn: async () => {
      // Simulate network delay
      await delay(500);
      return getMockJobs(page, pageSize);
    },
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      await delay(300);
      const job = getMockJobById(id);
      if (!job) {
        throw new Error("Job not found");
      }
      return job;
    },
    enabled: !!id,
  });
};
