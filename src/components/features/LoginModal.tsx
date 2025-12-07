"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock, Email, Close as CloseIcon } from "@mui/icons-material";
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
        className: "rounded-3xl overflow-hidden",
      }}
    >
      <DialogContent className="p-0 flex">
        <AuthLeftPanel />

        <div className="w-full md:w-1/2 p-10 relative bg-white">
          <IconButton
            onClick={closeSignIn}
            className="absolute top-4 right-4 text-grey-500"
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h4"
            className="font-bold text-grey-900 mb-6 leading-snug"
          >
            <span className="mr-2">👋</span>
            Welcome Back, Glad
            <br />
            To See Your Again
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Typography
                variant="body2"
                className="mb-1 text-grey-700 flex items-center gap-1"
              >
                Enter Your Email *
                <span className="text-grey-400 text-xs">i</span>
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
                <span className="text-grey-400 text-xs">i</span>
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

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              className="mt-2 rounded-full py-3 text-base"
            >
              Log In
            </Button>

            <p className="text-center text-sm text-grey-600 mt-4">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="text-primary-600 font-semibold"
                onClick={handleSwitchToSignUp}
              >
                Create free account
              </button>
            </p>

            <div className="mt-3 text-[11px] rounded-md bg-grey-50 px-3 py-2 text-grey-600">
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
