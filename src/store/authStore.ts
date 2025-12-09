"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, userApi, User as ApiUser } from "@/lib/api";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  role: "job_seeker" | "employer" | "admin";
  profileCompletion: number;
  resumeUploaded: boolean;
  isOnboarded?: boolean;
  isEmailVerified?: boolean;
  profile?: ApiUser["profile"];
  education?: ApiUser["education"];
  experience?: ApiUser["experience"];
  resume?: ApiUser["resume"];
  preferences?: ApiUser["preferences"];
  employer?: ApiUser["employer"];
  onboarding?: ApiUser["onboarding"];
  savedJobs?: string[];
  followingCompanies?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API Actions
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: "job_seeker" | "employer") => Promise<boolean>;
  loginWithGoogle: () => void;
  fetchCurrentUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Helper to convert API user to store user
const mapApiUserToStoreUser = (apiUser: ApiUser): User => ({
  id: apiUser._id || apiUser.id,
  _id: apiUser._id,
  name: apiUser.name,
  email: apiUser.email,
  avatar: apiUser.avatar,
  role: apiUser.role,
  profileCompletion: apiUser.profileCompletion || 0,
  resumeUploaded: !!apiUser.resume?.url,
  isOnboarded: apiUser.isOnboarded,
  isEmailVerified: apiUser.isEmailVerified,
  profile: apiUser.profile,
  education: apiUser.education,
  experience: apiUser.experience,
  resume: apiUser.resume,
  preferences: apiUser.preferences,
  employer: apiUser.employer,
  onboarding: apiUser.onboarding,
  savedJobs: apiUser.savedJobs,
  followingCompanies: apiUser.followingCompanies,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: (user) => set({ user, isAuthenticated: true, error: null }),
      
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ user: null, isAuthenticated: false, error: null });
        }
      },
      
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
        
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      loginWithCredentials: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          if (response.success && response.data) {
            const user = mapApiUserToStoreUser(response.data.user);
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          }
          set({ isLoading: false, error: "Login failed" });
          return false;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Login failed";
          set({ isLoading: false, error: message });
          return false;
        }
      },
      
      register: async (email, password, name, role = "job_seeker") => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ email, password, name, role });
          if (response.success && response.data) {
            const user = mapApiUserToStoreUser(response.data.user);
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          }
          set({ isLoading: false, error: "Registration failed" });
          return false;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Registration failed";
          set({ isLoading: false, error: message });
          return false;
        }
      },
      
      loginWithGoogle: () => {
        authApi.googleAuth();
      },
      
      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.getMe();
          if (response.success && response.data) {
            const user = mapApiUserToStoreUser(response.data);
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
      
      refreshUser: async () => {
        try {
          const response = await userApi.getProfile();
          if (response.success && response.data) {
            const user = mapApiUserToStoreUser(response.data);
            set({ user, isAuthenticated: true });
          }
        } catch (error) {
          console.error("Failed to refresh user:", error);
        }
      },
    }),
    {
      name: "careerkart-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
