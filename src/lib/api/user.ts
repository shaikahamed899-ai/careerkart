import { apiClient } from './client';
import { User } from './auth';

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  grade?: string;
  description?: string;
}

export interface Experience {
  _id?: string;
  company: string;
  title: string;
  employmentType?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  skills?: string[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface ProfileUpdate {
  name?: string;
  phone?: string;
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
    currentSalary?: {
      amount: number;
      currency?: string;
    };
    expectedSalary?: {
      min: number;
      max: number;
      currency?: string;
    };
    noticePeriod?: string;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
      twitter?: string;
    };
  };
}

export interface Preferences {
  jobAlerts?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  profileVisibility?: 'public' | 'private' | 'recruiters_only';
  preferredJobTypes?: string[];
  preferredLocations?: string[];
  preferredIndustries?: string[];
}

export const userApi = {
  getProfile: async () => {
    return apiClient.get<User>('/users/profile');
  },

  updateProfile: async (data: ProfileUpdate) => {
    return apiClient.put<User>('/users/profile', data);
  },

  uploadAvatar: async (file: File) => {
    return apiClient.uploadFile<{ avatar: string }>('/users/avatar', file, 'avatar');
  },

  uploadResume: async (file: File) => {
    return apiClient.uploadFile<{ resume: { url: string; fileName: string } }>(
      '/users/resume',
      file,
      'resume'
    );
  },

  deleteResume: async () => {
    return apiClient.delete('/users/resume');
  },

  // Education
  addEducation: async (education: Education) => {
    return apiClient.post<Education[]>('/users/education', education);
  },

  updateEducation: async (educationId: string, education: Education) => {
    return apiClient.put<Education[]>(`/users/education/${educationId}`, education);
  },

  deleteEducation: async (educationId: string) => {
    return apiClient.delete(`/users/education/${educationId}`);
  },

  // Experience
  addExperience: async (experience: Experience) => {
    return apiClient.post<Experience[]>('/users/experience', experience);
  },

  updateExperience: async (experienceId: string, experience: Experience) => {
    return apiClient.put<Experience[]>(`/users/experience/${experienceId}`, experience);
  },

  deleteExperience: async (experienceId: string) => {
    return apiClient.delete(`/users/experience/${experienceId}`);
  },

  // Skills
  updateSkills: async (skills: Skill[]) => {
    return apiClient.put<Skill[]>('/users/skills', { skills });
  },

  // Preferences
  updatePreferences: async (preferences: Preferences) => {
    return apiClient.put<Preferences>('/users/preferences', preferences);
  },

  // Public profile
  getPublicProfile: async (userId: string) => {
    return apiClient.get<User>(`/users/${userId}`);
  },

  // Account
  deactivateAccount: async () => {
    return apiClient.post('/users/deactivate');
  },
};
