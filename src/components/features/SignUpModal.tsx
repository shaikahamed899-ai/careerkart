"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Lock,
  Info,
  Person,
  Email,
  Business,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { AuthLeftPanel } from "@/components/features/AuthLeftPanel";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="#0A66C2"
  >
    <title>LinkedIn</title>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.447-2.136 2.941v5.665H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.602 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["job_seeker", "employer"]).default("job_seeker"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpModal() {
  const router = useRouter();
  const { isSignUpOpen, closeSignUp, openSignIn, showSnackbar } = useUIStore();
  const { register: registerUser, loginWithGoogle, error: authError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "job_seeker",
      acceptTerms: false,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignUpFormData) => {
    const success = await registerUser(data.email, data.password, data.name, data.role);
    
    if (success) {
      showSnackbar("Account created successfully!", "success");
      reset();
      closeSignUp();
      
      // Redirect based on role
      if (data.role === "employer") {
        router.push("/employer/company/setup");
      } else {
        router.push("/onboarding");
      }
    } else {
      setError("email", {
        type: "manual",
        message: authError || "Registration failed",
      });
      showSnackbar(authError || "Registration failed", "error");
    }
  };

  const handleGoogleSignUp = () => {
    loginWithGoogle();
    closeSignUp();
  };

  const handleSwitchToSignIn = () => {
    closeSignUp();
    openSignIn();
  };

  return (
    <Dialog
      open={isSignUpOpen}
      onClose={closeSignUp}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: "rounded-3xl overflow-hidden bg-white dark:bg-grey-950",
      }}
    >
      <DialogContent className="p-0 flex flex-col md:flex-row bg-white dark:bg-grey-950">
        {/* Left side - shared auth panel */}
        <AuthLeftPanel />

        {/* Right side - Form */}
        <div className="w-full relative md:w-1/2 md:ml-20 px-6 py-6 md:px-10 md:py-8 bg-white dark:bg-grey-900">
          <div className="absolute top-6 right-0">
            <IconButton onClick={closeSignUp} className="text-grey-500">
              <CloseIcon />
            </IconButton>
          </div>

          <h2 className="text-2xl font-bold text-grey-900 dark:text-grey-100 mb-2">
            Join Us today, because we take your job search to the next level
          </h2>

          {/* Social Login Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 border-grey-300"
              leftIcon={<LinkedInIcon />}
            >
              LinkedIn
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-grey-300"
              onClick={handleGoogleSignUp}
              leftIcon={
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
              }
            >
              Google
            </Button>
          </div>

          <Divider className="my-6">
            <span className="text-grey-500 text-sm">Or</span>
          </Divider>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2 block">
                I am a *
              </label>
              <div className="flex gap-3">
                <label
                  className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRole === "job_seeker"
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "border-grey-200 dark:border-grey-700 hover:border-grey-300"
                  }`}
                >
                  <input
                    type="radio"
                    {...register("role")}
                    value="job_seeker"
                    className="sr-only"
                  />
                  <div className="text-center">
                    <Person className={selectedRole === "job_seeker" ? "text-primary-600" : "text-grey-400"} />
                    <p className={`text-sm font-medium mt-1 ${selectedRole === "job_seeker" ? "text-primary-600" : "text-grey-700 dark:text-grey-300"}`}>
                      Job Seeker
                    </p>
                  </div>
                </label>
                <label
                  className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRole === "employer"
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "border-grey-200 dark:border-grey-700 hover:border-grey-300"
                  }`}
                >
                  <input
                    type="radio"
                    {...register("role")}
                    value="employer"
                    className="sr-only"
                  />
                  <div className="text-center">
                    <Business className={selectedRole === "employer" ? "text-primary-600" : "text-grey-400"} />
                    <p className={`text-sm font-medium mt-1 ${selectedRole === "employer" ? "text-primary-600" : "text-grey-700 dark:text-grey-300"}`}>
                      Employer
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-1 flex items-center gap-1">
                Enter Your Name *
                <Tooltip title="Enter your name" arrow placement="right">
                  <Info
                    fontSize="small"
                    className="text-grey-400 cursor-pointer"
                  />
                </Tooltip>
              </label>
              <TextField
                {...register("name")}
                placeholder="John Smith"
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
            </div>

            <div>
              <label className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-1 flex items-center gap-1">
                Enter Your Email *
                <Tooltip title="Enter your Email" arrow placement="right">
                  <Info
                    fontSize="small"
                    className="text-grey-400 cursor-pointer"
                  />
                </Tooltip>
              </label>
              <TextField
                {...register("email")}
                type="email"
                placeholder="hello@example.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
              />
            </div>

            <div>
              <label className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-1 flex items-center gap-1">
                Create Password *
                <Tooltip title="Create Password" arrow placement="right">
                  <Info
                    fontSize="small"
                    className="text-grey-400 cursor-pointer"
                  />
                </Tooltip>
              </label>
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
            </div>

            <FormControlLabel
              control={
                <Checkbox
                  {...register("acceptTerms")}
                  color="primary"
                />
              }
              label={
                <span className="text-sm text-grey-600 dark:text-grey-400">
                  I accept all the{" "}
                  <Link
                    href="/terms"
                    className="text-primary-600 hover:underline"
                  >
                    terms and conditions
                  </Link>{" "}
                  of CareerKart
                </span>
              }
            />
            {errors.acceptTerms && (
              <p className="text-error-500 text-sm">
                {errors.acceptTerms.message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              className="mt-4"
            >
              Register
            </Button>
          </form>

          <p className="text-center mt-6 text-grey-600 dark:text-grey-400">
            already have an account?{" "}
            <button
              onClick={handleSwitchToSignIn}
              className="text-primary-600 font-medium hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
