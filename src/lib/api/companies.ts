import { apiClient } from './client';
import { Job } from './jobs';

export interface Company {
  _id: string;
  name: string;
  slug: string;
  logo?: { url: string };
  coverImage?: { url: string };
  description?: string;
  shortDescription?: string;
  industry: string;
  companyType: string;
  companySize?: string;
  foundedYear?: number;
  website?: string;
  headquarters?: {
    city?: string;
    state?: string;
    country?: string;
  };
  locations?: Array<{
    city: string;
    state?: string;
    country?: string;
  }>;
  techStack?: string[];
  contact?: {
    email?: string;
    phone?: string;
    hrEmail?: string;
  };
  culture?: {
    values?: string[];
  };
  ratings: {
    overall: number;
    workLifeBalance: number;
    salaryBenefits: number;
    jobSecurity: number;
    careerGrowth: number;
    culture: number;
    totalReviews: number;
  };
  benefits?: Array<{
    category: string;
    name: string;
    description?: string;
  }>;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  followersCount: number;
  isVerified: boolean;
  activeJobsCount?: number;
  reviewsCount?: number;
  salariesCount?: number;
  interviewsCount?: number;
  isFollowing?: boolean;
}

export interface Review {
  _id: string;
  jobTitle: string;
  employmentStatus: 'current' | 'former';
  ratings: {
    overall: number;
    workLifeBalance?: number;
    salaryBenefits?: number;
    careerGrowth?: number;
    culture?: number;
  };
  title: string;
  pros: string;
  cons: string;
  advice?: string;
  recommendToFriend?: boolean;
  helpful: number;
  createdAt: string;
  isAnonymous: boolean;
}

export interface SalaryStat {
  _id: string;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  count: number;
  avgExperience?: number;
}

export interface InterviewExperience {
  _id: string;
  jobTitle: string;
  experience: 'positive' | 'negative' | 'neutral';
  difficulty: number;
  gotOffer?: boolean;
  review?: string;
  tips?: string;
  rounds?: Array<{
    type: string;
    description?: string;
    questions?: Array<{
      question: string;
      difficulty?: string;
    }>;
  }>;
  createdAt: string;
}

export interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  sortBy?: 'popular' | 'rating' | 'newest' | 'alphabetical';
}

export const companiesApi = {
  getCompanies: async (filters: CompanyFilters = {}) => {
    return apiClient.get<Company[]>('/companies', filters as Record<string, string | number | boolean | undefined>);
  },

  getCompany: async (idOrSlug: string) => {
    return apiClient.get<Company>(`/companies/${idOrSlug}`);
  },

  getCompanyJobs: async (idOrSlug: string, page = 1, limit = 10) => {
    return apiClient.get<Job[]>(`/companies/${idOrSlug}/jobs`, { page, limit });
  },

  getCompanyReviews: async (idOrSlug: string, page = 1, limit = 10, sortBy = 'newest') => {
    return apiClient.get<Review[]>(`/companies/${idOrSlug}/reviews`, { page, limit, sortBy });
  },

  getCompanySalaries: async (idOrSlug: string, page = 1, limit = 10, jobTitle?: string) => {
    return apiClient.get<SalaryStat[]>(`/companies/${idOrSlug}/salaries`, { page, limit, jobTitle });
  },

  getCompanyInterviews: async (idOrSlug: string, page = 1, limit = 10) => {
    return apiClient.get<InterviewExperience[]>(`/companies/${idOrSlug}/interviews`, { page, limit });
  },

  toggleFollow: async (companyId: string) => {
    return apiClient.post<{ isFollowing: boolean }>(`/companies/${companyId}/follow`);
  },

  submitReview: async (companyId: string, data: Partial<Review>) => {
    return apiClient.post(`/companies/${companyId}/reviews`, data);
  },

  submitSalary: async (companyId: string, data: Record<string, unknown>) => {
    return apiClient.post(`/companies/${companyId}/salaries`, data);
  },

  submitInterview: async (companyId: string, data: Partial<InterviewExperience>) => {
    return apiClient.post(`/companies/${companyId}/interviews`, data);
  },

  getFilterOptions: async () => {
    return apiClient.get<{
      industries: string[];
      locations: string[];
      sizes: string[];
    }>('/companies/filters');
  },
};
