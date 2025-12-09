import { apiClient } from './client';
import { Job, Application } from './jobs';
import { Company } from './companies';

export interface CreateCompanyData {
  name: string;
  industry: string;
  companyType?: string;
  companySize?: string;
  description?: string;
  shortDescription?: string;
  website?: string;
  foundedYear?: number;
  headquarters?: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    hrEmail?: string;
  };
  interviewStats?: {
    averageDifficulty?: number;
  };
}

export interface CreateJobData {
  title: string;
  description: string;
  shortDescription?: string;
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  workMode: 'onsite' | 'remote' | 'hybrid';
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  experience?: {
    min: number;
    max?: number;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
    showSalary?: boolean;
    isNegotiable?: boolean;
  };
  skills: Array<{
    name: string;
    isRequired?: boolean;
  }>;
  education?: {
    minQualification?: string;
    preferredDegrees?: string[];
  };
  industry?: string;
  department?: string;
  openings?: number;
  deadline?: string;
  status?: string;
  applicationSettings?: {
    resumeRequired?: boolean;
    coverLetterRequired?: boolean;
    questionnaire?: Array<{
      question: string;
      type: string;
      options?: string[];
      isRequired?: boolean;
    }>;
  };
  tags?: string[];
}

export interface ApplicationWithApplicant extends Application {
  applicant: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    profile?: {
      headline?: string;
      totalExperience?: {
        years: number;
        months: number;
      };
      skills?: Array<{ name: string; level: string }>;
    };
    resume?: {
      url: string;
      fileName: string;
    };
  };
  matchScore?: {
    overall: number;
  };
}

export interface ScheduleInterviewData {
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
  scheduledAt: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  interviewers?: Array<{
    name: string;
    email?: string;
    designation?: string;
  }>;
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  shortlistedCount: number;
  interviewsScheduled: number;
  hiredCount: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentApplications: ApplicationWithApplicant[];
  recentJobs: Job[];
  applicationsByStatus: Record<string, number>;
}

export interface AnalyticsData {
  applicationsOverTime: Array<{ _id: string; count: number }>;
  jobStats: { totalViews: number; totalApplications: number };
  topJobs: Job[];
  conversionFunnel: {
    total: number;
    viewed: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
  };
  sourceBreakdown: Record<string, number>;
}

export const employerApi = {
  // Dashboard & Analytics
  getDashboard: async () => {
    return apiClient.get<DashboardData>('/employer/dashboard');
  },

  getAnalytics: async (period = 30) => {
    return apiClient.get<AnalyticsData>('/employer/analytics', { period });
  },

  getApplicationAnalytics: async (period = 30) => {
    return apiClient.get('/employer/analytics/applications', { period });
  },

  getJobAnalytics: async () => {
    return apiClient.get('/employer/analytics/jobs');
  },

  // Company
  getMyCompany: async () => {
    return apiClient.get<Company & { activeJobsCount: number; totalApplications: number }>('/employer/company');
  },

  createCompany: async (data: CreateCompanyData) => {
    return apiClient.post<Company>('/employer/company', data);
  },

  updateCompany: async (data: Partial<CreateCompanyData>) => {
    return apiClient.put<Company>('/employer/company', data);
  },

  uploadCompanyLogo: async (file: File) => {
    return apiClient.uploadFile<{ logo: string }>('/employer/company/logo', file, 'logo');
  },

  uploadCompanyCover: async (file: File) => {
    return apiClient.uploadFile<{ coverImage: string }>('/employer/company/cover', file, 'coverImage');
  },

  // Jobs
  getMyJobs: async (page = 1, limit = 10, status?: string) => {
    return apiClient.get<Job[]>('/employer/jobs', { page, limit, status });
  },

  getJob: async (jobId: string) => {
    return apiClient.get<Job>(`/employer/jobs/${jobId}`);
  },

  createJob: async (data: CreateJobData) => {
    return apiClient.post<Job>('/employer/jobs', data);
  },

  updateJob: async (jobId: string, data: Partial<CreateJobData>) => {
    return apiClient.put<Job>(`/employer/jobs/${jobId}`, data);
  },

  deleteJob: async (jobId: string) => {
    return apiClient.delete(`/employer/jobs/${jobId}`);
  },

  // Applications
  getAllApplications: async (
    page = 1,
    limit = 20,
    status?: string,
    sortBy?: 'newest' | 'oldest' | 'match_score'
  ) => {
    return apiClient.get<ApplicationWithApplicant[]>('/employer/applications', {
      page,
      limit,
      status,
      sortBy,
    });
  },

  getJobApplications: async (
    jobId: string,
    page = 1,
    limit = 20,
    status?: string,
    sortBy?: 'newest' | 'oldest' | 'match_score'
  ) => {
    return apiClient.get<ApplicationWithApplicant[]>(`/employer/jobs/${jobId}/applications`, {
      page,
      limit,
      status,
      sortBy,
    });
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: string,
    notes?: string
  ) => {
    return apiClient.put(`/employer/applications/${applicationId}/status`, { status, notes });
  },

  scheduleInterview: async (applicationId: string, data: ScheduleInterviewData) => {
    return apiClient.post(`/employer/applications/${applicationId}/interview`, data);
  },
};
