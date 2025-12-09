"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Typography, CircularProgress, Chip } from "@mui/material";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Logo } from "@/components/ui/Logo";
import { onboardingApi, OnboardingQuestion } from "@/lib/api/onboarding";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { ArrowBack, ArrowForward, Check } from "@mui/icons-material";

function OnboardingStepsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuthStore();
  const { showSnackbar } = useUIStore();

  const userType = searchParams.get("type") as "fresher" | "experienced" | "employer" || "fresher";

  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await onboardingApi.getQuestions(userType);
        if (response.success && response.data) {
          setQuestions(response.data.questions);
        }
      } catch (error) {
        showSnackbar("Failed to load onboarding questions", "error");
        router.push("/onboarding");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [userType, router, showSnackbar]);

  const currentQuestion = questions[currentStep];
  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  const handleFieldChange = (fieldName: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id]: {
        ...prev[currentQuestion?.id],
        [fieldName]: value,
      },
    }));
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    setIsSaving(true);
    try {
      const response = await onboardingApi.saveStep(
        currentQuestion.step,
        answers[currentQuestion.id] || {}
      );

      if (response.success) {
        if (isLastStep) {
          // Complete onboarding
          await onboardingApi.complete();
          await refreshUser();
          showSnackbar("Onboarding completed! Welcome aboard!", "success");
          router.push("/jobs");
        } else {
          setCurrentStep((prev) => prev + 1);
        }
      }
    } catch (error) {
      showSnackbar("Failed to save your answers", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push("/onboarding");
    }
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      await onboardingApi.skip();
      await refreshUser();
      showSnackbar("You can complete your profile later", "info");
      router.push("/jobs");
    } catch (error) {
      showSnackbar("Failed to skip onboarding", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: OnboardingQuestion["fields"][0]) => {
    const value = answers[currentQuestion?.id]?.[field.name] || "";

    switch (field.type) {
      case "text":
      case "email":
      case "url":
        return (
          <TextField
            key={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            fullWidth
            required={field.required}
          />
        );

      case "textarea":
        return (
          <TextField
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            fullWidth
            multiline
            rows={4}
            required={field.required}
          />
        );

      case "number":
        return (
          <TextField
            key={field.name}
            label={field.label}
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value) || 0)}
            fullWidth
            required={field.required}
            inputProps={{ min: field.min, max: field.max }}
          />
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <Typography variant="body2" className="font-medium text-grey-700 dark:text-grey-300">
              {field.label} {field.required && "*"}
            </Typography>
            <div className="flex flex-wrap gap-2">
              {field.options?.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleFieldChange(field.name, option)}
                  variant={value === option ? "filled" : "outlined"}
                  color={value === option ? "primary" : "default"}
                  className="cursor-pointer"
                />
              ))}
            </div>
          </div>
        );

      case "multiselect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.name} className="space-y-2">
            <Typography variant="body2" className="font-medium text-grey-700 dark:text-grey-300">
              {field.label} {field.required && "*"}
            </Typography>
            <div className="flex flex-wrap gap-2">
              {field.options?.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => {
                    const newValues = selectedValues.includes(option)
                      ? selectedValues.filter((v: string) => v !== option)
                      : [...selectedValues, option];
                    handleFieldChange(field.name, newValues);
                  }}
                  variant={selectedValues.includes(option) ? "filled" : "outlined"}
                  color={selectedValues.includes(option) ? "primary" : "default"}
                  className="cursor-pointer"
                />
              ))}
            </div>
          </div>
        );

      case "skills":
        const skillsValue = Array.isArray(value) ? value : [];
        const [newSkill, setNewSkill] = useState("");
        const [skillLevel, setSkillLevel] = useState("intermediate");

        return (
          <div key={field.name} className="space-y-4">
            <Typography variant="body2" className="font-medium text-grey-700 dark:text-grey-300">
              {field.label} {field.required && "*"}
            </Typography>
            
            {/* Add new skill */}
            <div className="flex gap-2 items-end">
              <TextField
                placeholder="Enter a skill (e.g., JavaScript, Project Management)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newSkill.trim()) {
                    const skillWithLevel = {
                      name: newSkill.trim(),
                      level: skillLevel
                    };
                    const newSkills = [...skillsValue, skillWithLevel];
                    handleFieldChange(field.name, newSkills);
                    setNewSkill("");
                  }
                }}
                className="flex-1"
              />
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="px-3 py-2 border border-grey-300 dark:border-grey-600 rounded-md bg-white dark:bg-grey-800 text-grey-900 dark:text-grey-100"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  if (newSkill.trim()) {
                    const skillWithLevel = {
                      name: newSkill.trim(),
                      level: skillLevel
                    };
                    const newSkills = [...skillsValue, skillWithLevel];
                    handleFieldChange(field.name, newSkills);
                    setNewSkill("");
                  }
                }}
              >
                Add
              </Button>
            </div>

            {/* Current skills */}
            {skillsValue.length > 0 && (
              <div className="space-y-2">
                <Typography variant="caption" className="text-grey-600 dark:text-grey-400">
                  Added skills:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {skillsValue.map((skill: any, idx: number) => (
                    <Chip
                      key={idx}
                      label={`${skill.name} • ${skill.level}`}
                      variant="filled"
                      color="primary"
                      onDelete={() => {
                        const newSkills = skillsValue.filter((_: any, i: number) => i !== idx);
                        handleFieldChange(field.name, newSkills);
                      }}
                      className="capitalize"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "preferences":
        const preferences = value || {};
        return (
          <div key={field.name} className="space-y-4">
            <Typography variant="body2" className="font-medium text-grey-700 dark:text-grey-300">
              {field.label} {field.required && "*"}
            </Typography>
            
            {/* Job Types */}
            <div className="space-y-2">
              <Typography variant="caption" className="text-grey-600 dark:text-grey-400">
                Preferred Job Types
              </Typography>
              <div className="flex flex-wrap gap-2">
                {["Full-time", "Part-time", "Contract", "Internship", "Remote"].map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => {
                      const currentTypes = preferences.preferredJobTypes || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter((t: string) => t !== type)
                        : [...currentTypes, type];
                      handleFieldChange(field.name, { ...preferences, preferredJobTypes: newTypes });
                    }}
                    variant={preferences.preferredJobTypes?.includes(type) ? "filled" : "outlined"}
                    color={preferences.preferredJobTypes?.includes(type) ? "primary" : "default"}
                    className="cursor-pointer"
                  />
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <Typography variant="caption" className="text-grey-600 dark:text-grey-400">
                Preferred Locations
              </Typography>
              <div className="flex flex-wrap gap-2">
                {["New York", "San Francisco", "London", "Bangalore", "Remote"].map((location) => (
                  <Chip
                    key={location}
                    label={location}
                    onClick={() => {
                      const currentLocations = preferences.preferredLocations || [];
                      const newLocations = currentLocations.includes(location)
                        ? currentLocations.filter((l: string) => l !== location)
                        : [...currentLocations, location];
                      handleFieldChange(field.name, { ...preferences, preferredLocations: newLocations });
                    }}
                    variant={preferences.preferredLocations?.includes(location) ? "filled" : "outlined"}
                    color={preferences.preferredLocations?.includes(location) ? "primary" : "default"}
                    className="cursor-pointer"
                  />
                ))}
              </div>
            </div>

            {/* Job Alerts */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="jobAlerts"
                checked={preferences.jobAlerts || false}
                onChange={(e) => {
                  handleFieldChange(field.name, { ...preferences, jobAlerts: e.target.checked });
                }}
                className="rounded"
              />
              <label htmlFor="jobAlerts" className="text-sm text-grey-700 dark:text-grey-300">
                Send me job alerts matching my preferences
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50 dark:bg-grey-950">
        <CircularProgress />
      </div>
    );
  }

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
              Step {currentStep + 1} of {totalSteps}
            </Typography>
            <Typography variant="subtitle1" className="font-semibold">
              {Math.round(progress)}%
            </Typography>
          </div>
          <div className="flex gap-1 mb-2">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  idx <= currentStep ? "bg-success-500" : "bg-grey-300 dark:bg-grey-600"
                }`}
              />
            ))}
          </div>
          <Typography variant="body2" className="text-grey-600 dark:text-grey-400">
            {isLastStep ? "Almost done!" : "Keep going, you're doing great!"}
          </Typography>
        </Card>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="p-8 max-w-lg mx-auto">
            <Typography
              variant="h5"
              className="font-bold text-grey-900 dark:text-white mb-2"
            >
              {currentQuestion.title}
            </Typography>
            <Typography
              variant="body2"
              className="text-grey-600 dark:text-grey-400 mb-6"
            >
              {currentQuestion.description}
            </Typography>

            <div className="space-y-4">
              {currentQuestion.fields.map(renderField)}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                leftIcon={<ArrowBack />}
              >
                Back
              </Button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isSaving}
                className="text-grey-500 hover:text-grey-700 dark:text-grey-400 dark:hover:text-grey-200 text-sm"
              >
                Skip for now
              </button>

              <Button
                variant="primary"
                onClick={handleNext}
                isLoading={isSaving}
                rightIcon={isLastStep ? <Check /> : <ArrowForward />}
              >
                {isLastStep ? "Complete" : "Continue"}
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </div>
  );
}

export default function OnboardingStepsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-grey-50 dark:bg-grey-950">
        <CircularProgress />
      </div>
    }>
      <OnboardingStepsContent />
    </Suspense>
  );
}
