"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { fetchCurrentUser, user } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app load
    const initializeAuth = async () => {
      try {
        // Check if we have tokens but no user data
        const accessToken = authApi.getAccessToken();
        const refreshToken = authApi.getRefreshToken();
        
        if (accessToken && refreshToken && !user) {
          await fetchCurrentUser();
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear invalid tokens
        await authApi.logout();
      }
    };

    initializeAuth();
  }, [fetchCurrentUser, user]);

  return <>{children}</>;
}
