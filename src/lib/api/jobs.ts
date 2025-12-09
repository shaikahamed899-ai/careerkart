import { apiClient } from './client';

export interface Job {
  _id: string;
  title: string;
  slug: string;
  company: {
    _id: string;
    name: string;
    logo?: { url: string };
    ratings?: { overall: number };
    headquarters?: { city: string };
  };
  description: string;
  shortDescription?: string;
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  workMode: 'onsite' | 'remote' | 'hybrid';
  location: {
    city?: string;
    state?: string;
    country?: string;
    isRemote?: boolean;
  };
  experience: {
    min: number;
    max?: number;
  };
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: string;
    showSalary: boolean;
  };
  skills: Array<{
    name: string;
    isRequired: boolean;
  }>;
  education?: {
    minQualification: string;
    preferredDegrees?: string[];
  };
  industry?: string;
  department?: string;
  openings: number;
  postedAt: string;
  deadline?: string;
  status: string;
  stats: {
    views: number;
    applications: number;
  };
  isFeatured?: boolean;
  hasApplied?: boolean;
  isSaved?: boolean;
  matchScore?: number;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  employmentType?: string | string[];
  workMode?: string | string[];
  location?: string;
  industry?: string;
  department?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  company?: string;
  postedWithin?: number;
  sortBy?: 'newest' | 'oldest' | 'salary_high' | 'salary_low' | 'relevance';
}

export interface FilterOptions {
  employmentTypes: Array<{ value: string; label: string }>;
  workModes: Array<{ value: string; label: string }>;
  locations: string[];
  industries: string[];
  departments: string[];
  experienceRange: { minExp: number; maxExp: number };
  salaryRange: { minSalary: number; maxSalary: number };
}

export interface Application {
  _id: string;
  job: Job;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  resume?: {
    url: string;
    fileName: string;
  };
  interviews?: Array<{
    type: string;
    scheduledAt: string;
    status: string;
  }>;
}

export const jobsApi = {
  getJobs: async (filters: JobFilters = {}) => {
    const params: Record<string, string | number | boolean | undefined> = {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      location: filters.location,
      industry: filters.industry,
      department: filters.department,
      experienceMin: filters.experienceMin,
      experienceMax: filters.experienceMax,
      salaryMin: filters.salaryMin,
      salaryMax: filters.salaryMax,
      postedWithin: filters.postedWithin,
      sortBy: filters.sortBy,
    };

    // Handle array filters
    if (filters.employmentType) {
      params.employmentType = Array.isArray(filters.employmentType)
        ? filters.employmentType.join(',')
        : filters.employmentType;
    }
    if (filters.workMode) {
      params.workMode = Array.isArray(filters.workMode)
        ? filters.workMode.join(',')
        : filters.workMode;
    }
    if (filters.skills) {
      params.skills = filters.skills.join(',');
    }

    return apiClient.get<Job[]>('/jobs', params);
  },

  getFilterOptions: async () => {
    return apiClient.get<FilterOptions>('/jobs/filters');
  },

  getJob: async (id: string) => {
    return apiClient.get<Job>(`/jobs/${id}`);
  },

  getSimilarJobs: async (id: string) => {
    return apiClient.get<Job[]>(`/jobs/${id}/similar`);
  },

  searchJobs: async (query: string, page = 1, limit = 20) => {
    return apiClient.get<Job[]>('/jobs/search', { q: query, page, limit });
  },

  getRecommendedJobs: async (limit = 10) => {
    return apiClient.get<Job[]>('/jobs/recommended/for-you', { limit });
  },

  applyForJob: async (jobId: string, data: { coverLetter?: string; questionnaireAnswers?: unknown[] }) => {
    return apiClient.post(`/jobs/${jobId}/apply`, data);
  },

  getMyApplications: async (page = 1, limit = 10, status?: string) => {
    return apiClient.get<Application[]>('/jobs/applications/my', { page, limit, status });
  },

  withdrawApplication: async (applicationId: string) => {
    return apiClient.post(`/jobs/applications/${applicationId}/withdraw`);
  },

  toggleSaveJob: async (jobId: string) => {
    return apiClient.post<{ isSaved: boolean }>(`/users/saved-jobs/${jobId}`);
  },

  getSavedJobs: async () => {
    return apiClient.get<Job[]>('/users/saved-jobs');
  },
};
