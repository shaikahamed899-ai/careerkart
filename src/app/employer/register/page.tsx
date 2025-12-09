"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  Person,
  Phone,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function EmployerRegisterPage() {
  const router = useRouter();
  const { register: registerUser, error: authError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    const success = await registerUser(data.email, data.password, data.name, "employer");

    if (success) {
      router.push("/employer/company/setup");
    } else {
      setError(authError || "Registration failed. Please try again.");
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
              Start Hiring
              <br />
              Top Talent Today
            </Typography>
            <Typography className="text-primary-100 text-lg mb-8">
              Create your employer account and get access to our pool of
              qualified candidates ready to join your team.
            </Typography>
          </Box>

          <Box className="space-y-4">
            <Box className="flex items-start gap-3">
              <Box className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Typography className="font-bold text-sm">✓</Typography>
              </Box>
              <Box>
                <Typography className="font-medium">Free Job Posting</Typography>
                <Typography className="text-primary-200 text-sm">
                  Post unlimited jobs and reach millions of candidates
                </Typography>
              </Box>
            </Box>
            <Box className="flex items-start gap-3">
              <Box className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Typography className="font-bold text-sm">✓</Typography>
              </Box>
              <Box>
                <Typography className="font-medium">Smart Matching</Typography>
                <Typography className="text-primary-200 text-sm">
                  AI-powered candidate matching for better hires
                </Typography>
              </Box>
            </Box>
            <Box className="flex items-start gap-3">
              <Box className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Typography className="font-bold text-sm">✓</Typography>
              </Box>
              <Box>
                <Typography className="font-medium">Analytics Dashboard</Typography>
                <Typography className="text-primary-200 text-sm">
                  Track your hiring metrics and optimize recruitment
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Panel - Register Form */}
        <Box className="w-full md:w-1/2 p-8 md:p-12">
          <Typography variant="h4" className="font-bold text-grey-900 dark:text-white mb-2">
            Create Employer Account
          </Typography>
          <Typography className="text-grey-600 dark:text-grey-400 mb-8">
            Fill in your details to get started
          </Typography>

          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Full Name *
              </Typography>
              <TextField
                {...register("name")}
                placeholder="John Smith"
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
                leftIcon={<Person className="text-grey-400" />}
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Work Email *
              </Typography>
              <TextField
                {...register("email")}
                type="email"
                placeholder="john@company.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                leftIcon={<Email className="text-grey-400" />}
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Phone Number *
              </Typography>
              <TextField
                {...register("phone")}
                placeholder="9876543210"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                fullWidth
                leftIcon={<Phone className="text-grey-400" />}
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Password *
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

            <FormControlLabel
              control={
                <Checkbox {...register("acceptTerms")} color="primary" />
              }
              label={
                <Typography className="text-sm text-grey-600 dark:text-grey-400">
                  I accept the{" "}
                  <Link href="/terms" className="text-primary-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
            {errors.acceptTerms && (
              <Typography className="text-error-500 text-sm">
                {errors.acceptTerms.message}
              </Typography>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              className="py-3 rounded-xl text-base"
            >
              Create Account
            </Button>
          </form>

          <Box className="mt-8 text-center">
            <Typography className="text-grey-600 dark:text-grey-400">
              Already have an account?{" "}
              <Link
                href="/"
                className="text-primary-600 font-semibold hover:underline"
              >
                Sign In
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
