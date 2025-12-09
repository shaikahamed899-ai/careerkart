import { apiClient } from './client';

export interface OnboardingQuestion {
  step: number;
  id: string;
  title: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    min?: number;
    max?: number;
  }>;
}

export interface OnboardingStatus {
  isOnboarded: boolean;
  onboarding?: {
    userType?: 'fresher' | 'experienced' | 'employer';
    currentStep?: number;
    completedSteps?: number[];
    answers?: Record<string, unknown>;
  };
}

export interface OnboardingOptions {
  skills: string[];
  locations: string[];
  industries: string[];
}

export const onboardingApi = {
  getQuestions: async (userType: 'fresher' | 'experienced' | 'employer') => {
    return apiClient.get<{
      userType: string;
      totalSteps: number;
      questions: OnboardingQuestion[];
    }>('/onboarding/questions', { userType });
  },

  getStatus: async () => {
    return apiClient.get<OnboardingStatus>('/onboarding/status');
  },

  getOptions: async () => {
    return apiClient.get<OnboardingOptions>('/onboarding/options');
  },

  setUserType: async (userType: 'fresher' | 'experienced' | 'employer') => {
    return apiClient.post<{
      userType: string;
      questions: OnboardingQuestion[];
      currentStep: number;
    }>('/onboarding/user-type', { userType });
  },

  saveStep: async (step: number, answers: Record<string, unknown>) => {
    return apiClient.post<{
      currentStep: number;
      completedSteps: number[];
      isLastStep: boolean;
    }>('/onboarding/step', { step, answers });
  },

  complete: async () => {
    return apiClient.post('/onboarding/complete');
  },

  skip: async () => {
    return apiClient.post('/onboarding/skip');
  },
};
