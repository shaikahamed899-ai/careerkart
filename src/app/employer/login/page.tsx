"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function EmployerLoginPage() {
  const router = useRouter();
  const { loginWithCredentials, error: authError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const success = await loginWithCredentials(data.email, data.password);

    if (success) {
      const user = useAuthStore.getState().user;
      if (user?.role === "employer") {
        if (!user.employer?.companyId) {
          router.push("/employer/company/setup");
        } else {
          router.push("/employer");
        }
      } else {
        setError("This account is not registered as an employer. Please use the job seeker login.");
        useAuthStore.getState().logout();
      }
    } else {
      setError(authError || "Invalid email or password");
    }
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-grey-900 dark:to-grey-950 flex items-center justify-center p-4">
      <Box className="w-full max-w-5xl flex flex-col md:flex-row bg-white dark:bg-grey-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Panel - Branding */}
        <Box className="w-full md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 md:p-12 text-white flex flex-col justify-between">
          <Box>
            <Box className="flex items-center gap-3 mb-8">
              <Box className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Business className="text-white text-2xl" />
              </Box>
              <Box>
                <Typography variant="h5" className="font-bold">
                  CareerKart
                </Typography>
                <Typography className="text-primary-200 text-sm">
                  Employer Portal
                </Typography>
              </Box>
            </Box>

            <Typography variant="h3" className="font-bold mb-4">
              Find Your Next
              <br />
              Great Hire
            </Typography>
            <Typography className="text-primary-100 text-lg mb-8">
              Access thousands of qualified candidates and streamline your
              hiring process with our powerful recruitment tools.
            </Typography>
          </Box>

          <Box className="space-y-4">
            <Box className="flex items-center gap-3">
              <Box className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Typography className="font-bold">1M+</Typography>
              </Box>
              <Typography>Active Job Seekers</Typography>
            </Box>
            <Box className="flex items-center gap-3">
              <Box className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Typography className="font-bold">50K+</Typography>
              </Box>
              <Typography>Companies Trust Us</Typography>
            </Box>
            <Box className="flex items-center gap-3">
              <Box className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Typography className="font-bold">95%</Typography>
              </Box>
              <Typography>Hiring Success Rate</Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Panel - Login Form */}
        <Box className="w-full md:w-1/2 p-8 md:p-12">
          <Typography variant="h4" className="font-bold text-grey-900 dark:text-white mb-2">
            Welcome Back
          </Typography>
          <Typography className="text-grey-600 dark:text-grey-400 mb-8">
            Sign in to access your employer dashboard
          </Typography>

          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Email Address
              </Typography>
              <TextField
                {...register("email")}
                type="email"
                placeholder="employer@company.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                leftIcon={<Email className="text-grey-400" />}
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Password
              </Typography>
              <TextField
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={!!errors.password}
                helperText={errors.password?.message}
                fullWidth
                leftIcon={<Lock className="text-grey-400" />}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box className="flex justify-between items-center">
              <Link
                href="/forgot-password"
                className="text-primary-600 text-sm hover:underline"
              >
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              className="py-3 rounded-xl text-base"
            >
              Sign In
            </Button>
          </form>

          <Box className="mt-8 text-center">
            <Typography className="text-grey-600 dark:text-grey-400">
              Don&apos;t have an employer account?{" "}
              <Link
                href="/employer/register"
                className="text-primary-600 font-semibold hover:underline"
              >
                Register Now
              </Link>
            </Typography>
          </Box>

          <Box className="mt-6 text-center">
            <Link
              href="/"
              className="text-grey-500 text-sm hover:text-primary-600"
            >
              ← Back to Job Seeker Portal
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
