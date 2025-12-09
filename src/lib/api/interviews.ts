import { apiClient } from './client';

export interface InterviewBotConfig {
  jobRole?: string;
  company?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  skills?: string[];
  duration?: number;
  questionCount?: number;
}

export interface InterviewSession {
  _id: string;
  type: 'technical' | 'behavioral' | 'hr' | 'mixed';
  config: InterviewBotConfig;
  status: 'in_progress' | 'completed' | 'abandoned';
  conversation: Array<{
    role: 'system' | 'assistant' | 'user';
    content: string;
    questionNumber?: number;
    feedback?: {
      score: number;
      strengths: string[];
      improvements: string[];
      suggestion: string;
    };
  }>;
  results?: InterviewResults;
  startedAt: string;
  completedAt?: string;
}

export interface InterviewResults {
  overallScore: number;
  categoryScores: {
    technicalKnowledge: number;
    communication: number;
    problemSolving: number;
    confidence: number;
  };
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  summary: string;
}

export interface AnswerResponse {
  isComplete: boolean;
  feedback: {
    score: number;
    strengths: string[];
    improvements: string[];
    suggestion: string;
  };
  nextQuestion?: {
    number: number;
    content: string;
  };
  progress?: {
    current: number;
    total: number;
  };
  results?: InterviewResults;
}

export const interviewsApi = {
  startSession: async (type: 'technical' | 'behavioral' | 'hr' | 'mixed', config?: InterviewBotConfig) => {
    return apiClient.post<{
      sessionId: string;
      type: string;
      config: InterviewBotConfig;
      currentQuestion: {
        number: number;
        content: string;
      };
    }>('/interviews/bot/start', { type, config });
  },

  submitAnswer: async (sessionId: string, answer: string) => {
    return apiClient.post<AnswerResponse>(`/interviews/bot/${sessionId}/answer`, { answer });
  },

  getSession: async (sessionId: string) => {
    return apiClient.get<InterviewSession>(`/interviews/bot/${sessionId}`);
  },

  endSession: async (sessionId: string) => {
    return apiClient.post(`/interviews/bot/${sessionId}/end`);
  },

  getHistory: async (page = 1, limit = 10) => {
    return apiClient.get<InterviewSession[]>('/interviews/bot/history', { page, limit });
  },
};
