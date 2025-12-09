import { apiClient } from './client';

export interface SalaryInsight {
  overview: {
    avgSalary: number;
    minSalary: number;
    maxSalary: number;
    medianSalary?: number;
    avgTotalComp?: number;
    count: number;
    avgExperience?: number;
  };
  byExperience: Array<{
    _id: number | string;
    avgSalary: number;
    count: number;
  }>;
  topCompanies: Array<{
    companyName: string;
    companyLogo?: string;
    avgSalary: number;
    count: number;
  }>;
  filters: {
    jobTitle?: string;
    location?: string;
    experience?: string;
    company?: string;
  };
}

export interface SalaryEntry {
  _id: string;
  company: {
    _id: string;
    name: string;
    logo?: { url: string };
  };
  jobTitle: string;
  location?: {
    city?: string;
    state?: string;
  };
  baseSalary: {
    amount: number;
    currency: string;
    period: string;
  };
  totalCompensation: number;
  totalExperience?: number;
  yearsAtCompany?: number;
  employmentType?: string;
  satisfaction?: number;
  createdAt: string;
}

export interface SalaryComparison {
  title: string;
  stats: {
    avgSalary: number;
    minSalary: number;
    maxSalary: number;
    count: number;
  };
}

export interface SalarySubmission {
  companyName: string;
  jobTitle: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  baseSalary: {
    amount: number;
    currency?: string;
    period?: string;
  };
  totalCompensation: number;
  totalExperience?: number;
  yearsAtCompany?: number;
  employmentType?: string;
  bonus?: {
    amount?: number;
    type?: string;
  };
  satisfaction?: number;
  review?: string;
  isAnonymous?: boolean;
}

export const salariesApi = {
  getInsights: async (filters: {
    jobTitle?: string;
    location?: string;
    experience?: number;
    company?: string;
  } = {}) => {
    return apiClient.get<SalaryInsight>('/salaries/insights', filters as Record<string, string | number | boolean | undefined>);
  },

  search: async (filters: {
    page?: number;
    limit?: number;
    jobTitle?: string;
    company?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    sortBy?: 'newest' | 'highest' | 'lowest';
  } = {}) => {
    return apiClient.get<SalaryEntry[]>('/salaries/search', filters as Record<string, string | number | boolean | undefined>);
  },

  getPopularTitles: async () => {
    return apiClient.get<Array<{
      _id: string;
      count: number;
      avgSalary: number;
    }>>('/salaries/popular-titles');
  },

  compare: async (titles: string[], locations?: string[]) => {
    return apiClient.post<SalaryComparison[]>('/salaries/compare', { titles, locations });
  },

  submit: async (data: SalarySubmission) => {
    return apiClient.post('/salaries', data);
  },

  getMySalaries: async () => {
    return apiClient.get<SalaryEntry[]>('/salaries/my');
  },

  getFilterOptions: async () => {
    return apiClient.get<{
      jobTitles: string[];
      locations: string[];
      companies: Array<{ _id: string; name: string }>;
    }>('/salaries/filters');
  },
};
