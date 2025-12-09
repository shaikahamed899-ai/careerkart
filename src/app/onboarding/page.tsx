"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, CircularProgress } from "@mui/material";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { onboardingApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import clsx from "clsx";

type OnboardingUserType = "fresher" | "experienced" | "employer";

const userTypes: { type: OnboardingUserType; label: string; description: string }[] = [
  {
    type: "fresher",
    label: "Fresher",
    description: "Recently graduated or student, looking for first job",
  },
  {
    type: "experienced",
    label: "Experienced Professional",
    description: "Currently employed, exploring new opportunities",
  },
  {
    type: "employer",
    label: "Employer / Recruiter",
    description: "Looking to hire talented candidates",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const { showSnackbar } = useUIStore();
  const [selectedType, setSelectedType] = useState<OnboardingUserType | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSteps, setTotalSteps] = useState(4);

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.isOnboarded) {
      router.push("/jobs");
    }
  }, [user, router]);

  const progress = (step / totalSteps) * 100;
  const progressText =
    step === 1
      ? "A Few Steps More"
      : step === totalSteps - 1
      ? "We Are Almost Done"
      : step === totalSteps
      ? "Bravo! we are set to go."
      : "Keep Going!";

  const handleContinue = async () => {
    if (step === 1 && selectedType) {
      setIsLoading(true);
      try {
        const response = await onboardingApi.setUserType(selectedType);
        if (response.success && response.data) {
          setTotalSteps(response.data.questions.length + 1); // +1 for user type step
          // Navigate to the onboarding steps page
          router.push(`/onboarding/steps?type=${selectedType}`);
        }
      } catch (error) {
        showSnackbar("Failed to save user type", "error");
        console.error("Onboarding error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onboardingApi.skip();
      await refreshUser();
      showSnackbar("You can complete your profile later", "info");
      router.push("/jobs");
    } catch (error) {
      showSnackbar("Failed to skip onboarding", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20 dark:from-grey-950 dark:via-grey-900 dark:to-grey-950">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-100 dark:bg-accent-900/20 rounded-full blur-3xl opacity-30" />

      <Container maxWidth="md" className="relative z-10 py-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Progress Card */}
        <Card className="p-6 mb-8 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="subtitle1" className="font-semibold">
              Complete Your Profile
            </Typography>
            <Typography variant="subtitle1" className="font-semibold">
              {Math.round(progress)}%
            </Typography>
          </div>
          <div className="flex gap-2 mb-2">
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 1 ? "bg-success-500" : "bg-grey-300 dark:bg-grey-600"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 2 ? "bg-success-500" : "bg-grey-300 dark:bg-grey-600"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 3 ? "bg-success-500" : "bg-grey-300 dark:bg-grey-600"
              }`}
            />
          </div>
          <Typography
            variant="body2"
            className="text-grey-600 dark:text-grey-400"
          >
            {progressText}
          </Typography>
        </Card>

        {/* Main Content */}
        <div className="text-center mb-8">
          <Typography
            variant="h3"
            className="text-3xl md:text-4xl font-bold text-grey-900 dark:text-white mb-4"
          >
            Let Us Know About You
          </Typography>
          <Typography
            variant="body1"
            className="text-grey-600 dark:text-grey-400"
          >
            Are you a...
          </Typography>
        </div>

        {/* User Type Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {userTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              className={clsx(
                "px-6 py-3 rounded-full border-2 transition-all duration-200",
                selectedType === item.type
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "border-grey-300 dark:border-grey-700 hover:border-primary-400 text-grey-700 dark:text-grey-300"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            variant="primary"
            size="large"
            onClick={handleContinue}
            disabled={!selectedType || isLoading}
            isLoading={isLoading}
            className="px-12"
          >
            Continue
          </Button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="text-grey-500 hover:text-grey-700 dark:text-grey-400 dark:hover:text-grey-200 text-sm underline"
          >
            Skip for now
          </button>
        </div>
      </Container>
    </div>
  );
}
