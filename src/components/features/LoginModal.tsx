"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock, Email, Close as CloseIcon, Info } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { AuthLeftPanel } from "@/components/features/AuthLeftPanel";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const DEMO_EMAIL = "demo@careerkart.com";
const DEMO_PASSWORD = "Demo@123";

export function LoginModal() {
  const { isSignInOpen, closeSignIn, openSignUp, showSnackbar } = useUIStore();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (data.email !== DEMO_EMAIL || data.password !== DEMO_PASSWORD) {
      setError("password", {
        type: "manual",
        message: "Invalid email or password",
      });
      showSnackbar("Invalid demo credentials", "error");
      return;
    }

    login({
      id: "demo-user",
      name: "Demo User",
      email: DEMO_EMAIL,
      avatar: undefined,
      role: "job_seeker",
      profileCompletion: 60,
      resumeUploaded: false,
    });

    showSnackbar("Logged in as Demo User", "success");
    closeSignIn();
  };

  const handleSwitchToSignUp = () => {
    closeSignIn();
    openSignUp();
  };

  return (
    <Dialog
      open={isSignInOpen}
      onClose={closeSignIn}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: "rounded-3xl overflow-hidden bg-white dark:bg-grey-950",
      }}
    >
      <DialogContent className="p-0 flex flex-col md:flex-row bg-white dark:bg-grey-950">
        <AuthLeftPanel />

        <div className="w-full md:w-1/2 md:ml-20 mt-6 md:mt-8 relative bg-white dark:bg-grey-900 px-6 py-6 md:px-10 md:py-8">
          <div className="absolute top-6 right-0">
            <IconButton onClick={closeSignIn} className="text-grey-500">
              <CloseIcon />
            </IconButton>
          </div>

          <Typography
            variant="h4"
            className="font-bold text-grey-900 dark:text-grey-50 mb-6 text-center md:text-left"
          >
            <span className="mr-2">👋</span>
            Welcome Back, Glad
            <br />
            To See Your Again
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Typography
                variant="body2"
                className="mb-1 text-grey-700 dark:text-grey-200 flex items-center gap-1"
              >
                Enter Your Email *
                <Tooltip title="Enter your Email" arrow placement="right">
                  <Info
                    fontSize="small"
                    className="text-grey-400 cursor-pointer"
                  />
                </Tooltip>
              </Typography>
              <TextField
                {...register("email")}
                type="email"
                placeholder="hello@example.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                leftIcon={<Email className="text-grey-400" />}
              />
            </div>

            <div>
              <Typography
                variant="body2"
                className="mb-1 text-grey-700 flex items-center gap-1"
              >
                Password *
                <Tooltip title="Enter Password" arrow placement="right">
                  <Info
                    fontSize="small"
                    className="text-grey-400 cursor-pointer"
                  />
                </Tooltip>
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
                        onClick={() => setShowPassword((p) => !p)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <div className="flex justify-between items-center text-sm mb-2">
              <button
                type="button"
                className="text-primary-600 font-medium"
              >
                Forgot Password
              </button>
            </div>

            <p className="text-start text-sm text-grey-600 dark:text-grey-400 mt-4">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="text-primary-600 font-semibold"
                onClick={handleSwitchToSignUp}
              >
                Create free account
              </button>
            </p>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              className="mt-2 rounded-full py-3 text-base"
            >
              Log In
            </Button>

            <div className="mt-3 text-[11px] rounded-md bg-grey-50 dark:bg-grey-900 px-3 py-2 text-grey-600 dark:text-grey-300">
              <span className="font-semibold mr-1">Demo:</span>
              Email <span className="font-mono mr-2">{DEMO_EMAIL}</span>
              Password <span className="font-mono">{DEMO_PASSWORD}</span>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
