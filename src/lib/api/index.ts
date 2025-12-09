export { apiClient, ApiError } from './client';
export type { ApiResponse } from './client';

export { authApi } from './auth';
export type { User, AuthResponse, RegisterData, LoginData } from './auth';

export { jobsApi } from './jobs';
export type { Job, JobFilters, FilterOptions, Application } from './jobs';

export { onboardingApi } from './onboarding';
export type { OnboardingQuestion, OnboardingStatus, OnboardingOptions } from './onboarding';

export { companiesApi } from './companies';
export type { Company, Review, SalaryStat, InterviewExperience, CompanyFilters } from './companies';

export { notificationsApi } from './notifications';
export type { Notification } from './notifications';

export { networkApi } from './network';
export type { Connection, ConnectionRequest, UserSuggestion } from './network';

export { userApi } from './user';
export type { Education, Experience, Skill, ProfileUpdate, Preferences } from './user';

export { salariesApi } from './salaries';
export type { SalaryInsight, SalaryEntry, SalaryComparison, SalarySubmission } from './salaries';

export { interviewsApi } from './interviews';
export type { InterviewBotConfig, InterviewSession, InterviewResults, AnswerResponse } from './interviews';

export { employerApi } from './employer';
export type { 
  CreateCompanyData, 
  CreateJobData, 
  ApplicationWithApplicant, 
  ScheduleInterviewData,
  DashboardStats,
  DashboardData,
  AnalyticsData,
} from './employer';
