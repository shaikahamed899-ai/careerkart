import { apiClient, ApiError } from './client';

export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'job_seeker' | 'employer' | 'admin';
  isEmailVerified: boolean;
  isOnboarded: boolean;
  authProvider: 'local' | 'google' | 'linkedin';
  profile?: {
    headline?: string;
    summary?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    totalExperience?: {
      years: number;
      months: number;
    };
    skills?: Array<{
      name: string;
      level: string;
    }>;
    expectedSalary?: {
      min: number;
      max: number;
    };
    noticePeriod?: string;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
  };
  education?: Array<{
    _id: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }>;
  experience?: Array<{
    _id: string;
    company: string;
    title: string;
    employmentType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }>;
  resume?: {
    url: string;
    fileName: string;
    uploadedAt: string;
  };
  employer?: {
    companyId?: string;
    designation?: string;
    department?: string;
    isVerified?: boolean;
  };
  preferences?: {
    jobAlerts: boolean;
    emailNotifications: boolean;
    profileVisibility: string;
    preferredJobTypes?: string[];
    preferredLocations?: string[];
  };
  profileCompletion: number;
  savedJobs?: string[];
  followingCompanies?: string[];
  onboarding?: {
    userType?: string;
    currentStep?: number;
    completedSteps?: number[];
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'job_seeker' | 'employer';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.success && response.data) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response;
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.success && response.data) {
      apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } finally {
      apiClient.clearTokens();
    }
  },

  getMe: async () => {
    return apiClient.get<User>('/auth/me');
  },

  googleAuth: () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/google`;
  },

  verifyEmail: async (token: string) => {
    return apiClient.post('/auth/verify-email', { token });
  },

  resendVerification: async () => {
    return apiClient.post('/auth/resend-verification');
  },

  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string) => {
    return apiClient.post('/auth/reset-password', { token, password });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },

  // Handle OAuth callback
  handleAuthCallback: (accessToken: string, refreshToken: string) => {
    apiClient.setTokens(accessToken, refreshToken);
  },

  getAccessToken: () => apiClient.getAccessToken(),

  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  updateRole: async (role: string) => {
    return apiClient.post<{ user: User }>('/auth/update-role', { role });
  },
};

export { ApiError };
