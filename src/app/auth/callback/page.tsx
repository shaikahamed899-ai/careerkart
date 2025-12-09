"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress, Typography, Box } from "@mui/material";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchCurrentUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const isNewUser = searchParams.get("isNewUser") === "true";
      const needsRoleSelection = searchParams.get("needsRoleSelection") === "true";
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Authentication failed. Please try again.");
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      if (accessToken && refreshToken) {
        // Store tokens
        authApi.handleAuthCallback(accessToken, refreshToken);

        // Fetch user data
        await fetchCurrentUser();

        const user = useAuthStore.getState().user;

        if (!user) {
          setError("Failed to load user after authentication");
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        // Handle role selection for new Google users
        if (needsRoleSelection) {
          router.push("/auth/role-selection");
          return;
        }

        // Normal routing for existing users
        if (user.role === "employer") {
          if (!user.employer?.companyId) {
            router.push("/employer/company/setup");
          } else {
            router.push("/employer");
          }
        } else {
          if (isNewUser || !user.isOnboarded) {
            router.push("/onboarding");
          } else {
            router.push("/jobs");
          }
        }
      } else {
        setError("Invalid authentication response");
        setTimeout(() => router.push("/"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, fetchCurrentUser]);

  if (error) {
    return (
      <Box className="min-h-screen flex flex-col items-center justify-center bg-grey-100">
        <Typography variant="h6" color="error" className="mb-4">
          {error}
        </Typography>
        <Typography variant="body2" className="text-grey-600">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen flex flex-col items-center justify-center bg-grey-100">
      <CircularProgress size={48} className="mb-4" />
      <Typography variant="h6" className="text-grey-700">
        Completing authentication...
      </Typography>
      <Typography variant="body2" className="text-grey-500 mt-2">
        Please wait while we log you in
      </Typography>
    </Box>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <Box className="min-h-screen flex flex-col items-center justify-center bg-grey-100">
        <CircularProgress size={48} className="mb-4" />
        <Typography variant="h6" className="text-grey-700">
          Loading...
        </Typography>
      </Box>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
