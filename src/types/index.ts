// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "job_seeker" | "employer";
  profileCompletion: number;
  resumeUploaded: boolean;
  phone?: string;
  location?: string;
  professionalSummary?: string;
  linkedinUrl?: string;
}

// Job types
export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship" | "remote";
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  postedAt: string;
  matchScore?: number;
  isSmartApply?: boolean;
  benefits?: string[];
  responsibilities?: string[];
  requiredScore?: number;
  yourScore?: number;
}

export interface JobFilters {
  search?: string;
  location?: string;
  type?: Job["type"][];
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  sortBy?: "relevance" | "date" | "salary";
}

// Notification types
export interface Notification {
  id: string;
  type: "job_match" | "resume_score" | "application" | "general";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
}

// Resume types
export interface Resume {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: "processing" | "completed" | "error";
  score?: number;
  feedback?: ResumeFeedback;
}

export interface ResumeFeedback {
  overall: number;
  sections: {
    name: string;
    score: number;
    suggestions: string[];
  }[];
}

// Profile types
export interface ProfileSection {
  id: string;
  title: string;
  completed: boolean;
  data?: Record<string, unknown>;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  grade?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  skills: string[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  professionalSummary: string;
}

// Onboarding types
export type UserType = "student" | "fresher" | "working_professional";

export interface OnboardingData {
  userType?: UserType;
  resume?: File;
  linkedinUrl?: string;
  profileInfo?: ProfileFormData;
}
