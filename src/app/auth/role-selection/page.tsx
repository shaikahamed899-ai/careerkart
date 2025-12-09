"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Container,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Business,
  Work,
  ArrowForward,
} from "@mui/icons-material";

export default function RoleSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuthStore();
  const { showSnackbar } = useUIStore();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const needsRoleSelection = searchParams.get("needsRoleSelection") === "true";

      if (accessToken && refreshToken) {
        // Store tokens
        authApi.handleAuthCallback(accessToken, refreshToken);

        // Fetch user data
        try {
          const response = await authApi.getMe();
          if (response.success && response.data) {
            login(response.data);
            
            // If user doesn't need role selection, redirect appropriately
            if (!needsRoleSelection) {
              handleRoleBasedRedirect(response.data);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          router.push("/");
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, login]);

  const handleRoleBasedRedirect = (userData: any) => {
    if (userData.role === "employer") {
      if (!userData.employer?.companyId) {
        router.push("/employer/company/setup");
      } else {
        router.push("/employer");
      }
    } else {
      router.push("/onboarding");
    }
  };

  const handleRoleSelection = async (role: string) => {
    setSelectedRole(role);
    setIsLoading(true);

    try {
      const response = await authApi.updateRole(role);
      if (response.success && response.data) {
        login(response.data.user);
        showSnackbar(`Role updated to ${role}`, "success");
        
        // Redirect based on selected role
        setTimeout(() => {
          if (role === "employer") {
            router.push("/employer/company/setup");
          } else {
            router.push("/onboarding");
          }
        }, 1000);
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to update role", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      value: "job_seeker",
      title: "Job Seeker",
      description: "Find and apply for jobs that match your skills",
      icon: <Work />,
      color: "primary" as const,
    },
    {
      value: "employer",
      title: "Employer",
      description: "Post jobs and find talented candidates",
      icon: <Business />,
      color: "success" as const,
    },
  ];

  if (!user) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-grey-50 dark:bg-grey-950">
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-grey-50 dark:bg-grey-950 py-12">
      <Container maxWidth="md">
        <Box className="text-center mb-8">
          <Typography variant="h3" className="font-bold mb-4">
            Welcome, {user.name}!
          </Typography>
          <Typography variant="h6" className="text-grey-600 dark:text-grey-400 mb-2">
            Choose how you want to use CareerKart
          </Typography>
          <Typography variant="body2" className="text-grey-500">
            You can always change this later in your settings
          </Typography>
        </Box>

        <Box className="grid md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card
              key={role.value}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRole === role.value
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-grey-100 dark:hover:bg-grey-900"
              }`}
              onClick={() => !isLoading && setSelectedRole(role.value)}
            >
              <Box className="flex flex-col items-center text-center">
                <Box className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  role.color === "primary" 
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                }`}>
                  {role.icon}
                </Box>
                
                <Typography variant="h5" className="font-semibold mb-2">
                  {role.title}
                </Typography>
                
                <Typography variant="body2" className="text-grey-600 dark:text-grey-400 mb-4">
                  {role.description}
                </Typography>
                
                <Chip
                  label={role.value === "job_seeker" ? "I'm looking for jobs" : "I'm hiring"}
                  color={role.color}
                  variant={selectedRole === role.value ? "filled" : "outlined"}
                  size="small"
                />
              </Box>
            </Card>
          ))}
        </Box>

        <Box className="mt-8 text-center">
          <Button
            variant="contained"
            size="large"
            disabled={!selectedRole || isLoading}
            loading={isLoading}
            onClick={() => selectedRole && handleRoleSelection(selectedRole)}
            className="px-8"
          >
            Continue
            <ArrowForward className="ml-2" />
          </Button>
          
          <Typography variant="body2" className="text-grey-500 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
