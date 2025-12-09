"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Alert,
  Paper,
} from "@mui/material";
import {
  Business,
  LocationOn,
  ContactPhone,
  CheckCircle,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { employerApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  companyType: z.string().optional(),
  companySize: z.string().optional(),
  description: z.string().min(50, "Description must be at least 50 characters"),
  shortDescription: z.string().max(200, "Short description must be under 200 characters").optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  headquarters: z.object({
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    country: z.string().default("India"),
    address: z.string().optional(),
  }),
  contact: z.object({
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    hrEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  }).optional(),
  interviewStats: z.object({
    averageDifficulty: z.number().min(1).max(5).optional(),
  }).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

const industries = [
  "Information Technology",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "E-commerce",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Telecommunications",
  "Automotive",
  "Hospitality",
  "Logistics",
  "Other",
];

const companySizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1001-5000", label: "1001-5000 employees" },
  { value: "5001-10000", label: "5001-10000 employees" },
  { value: "10000+", label: "10000+ employees" },
];

const companyTypes = [
  { value: "startup", label: "Startup" },
  { value: "mnc", label: "MNC" },
  { value: "corporate", label: "Corporate" },
  { value: "government", label: "Government" },
  { value: "ngo", label: "NGO" },
  { value: "other", label: "Other" },
];

const steps = ["Company Info", "Location", "Contact Details"];

export default function CompanySetupPage() {
  const router = useRouter();
  const { refreshUser, user, isAuthenticated } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated or not employer
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/employer/login");
      return;
    }
    if (user.role !== "employer") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      headquarters: {
        country: "India",
      },
    },
  });

  const validateStep = async () => {
    let fieldsToValidate: (keyof CompanyFormData)[] = [];
    
    switch (activeStep) {
      case 0:
        fieldsToValidate = ["name", "industry", "description"];
        break;
      case 1:
        fieldsToValidate = ["headquarters"];
        break;
      case 2:
        fieldsToValidate = [];
        break;
    }
    
    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: CompanyFormData) => {
    setError(null);
    try {
      const response = await employerApi.createCompany({
        ...data,
        foundedYear: data.foundedYear || undefined,
        website: data.website || undefined,
        interviewStats: {
          averageDifficulty: 1, // Default value to satisfy backend validation
        },
      });

      if (response.success) {
        await refreshUser();
        router.push("/employer");
      } else {
        setError("Failed to create company. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create company");
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box className="space-y-6">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Company Name *
              </Typography>
              <TextField
                {...register("name")}
                placeholder="Acme Corporation"
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Industry *
              </Typography>
              <TextField
                {...register("industry")}
                select
                error={!!errors.industry}
                helperText={errors.industry?.message}
                fullWidth
                value={watch("industry") || ""}
              >
                <MenuItem value="" disabled>
                  Select Industry
                </MenuItem>
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Company Type
                </Typography>
                <TextField
                  {...register("companyType")}
                  select
                  fullWidth
                  value={watch("companyType") || ""}
                >
                  <MenuItem value="">Select Type</MenuItem>
                  {companyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Company Size
                </Typography>
                <TextField
                  {...register("companySize")}
                  select
                  fullWidth
                  value={watch("companySize") || ""}
                >
                  <MenuItem value="">Select Size</MenuItem>
                  {companySizes.map((size) => (
                    <MenuItem key={size.value} value={size.value}>
                      {size.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Website
                </Typography>
                <TextField
                  {...register("website")}
                  placeholder="https://www.company.com"
                  error={!!errors.website}
                  helperText={errors.website?.message}
                  fullWidth
                />
              </Box>

              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Founded Year
                </Typography>
                <TextField
                  {...register("foundedYear", { valueAsNumber: true })}
                  type="number"
                  placeholder="2020"
                  error={!!errors.foundedYear}
                  helperText={errors.foundedYear?.message}
                  fullWidth
                />
              </Box>
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Company Description *
              </Typography>
              <TextField
                {...register("description")}
                multiline
                rows={4}
                placeholder="Tell us about your company, culture, and what makes it a great place to work..."
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Short Description (for listings)
              </Typography>
              <TextField
                {...register("shortDescription")}
                placeholder="A brief tagline for your company"
                error={!!errors.shortDescription}
                helperText={errors.shortDescription?.message || `${watch("shortDescription")?.length || 0}/200`}
                fullWidth
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box className="space-y-6">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                City *
              </Typography>
              <TextField
                {...register("headquarters.city")}
                placeholder="Mumbai"
                error={!!errors.headquarters?.city}
                helperText={errors.headquarters?.city?.message}
                fullWidth
              />
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  State
                </Typography>
                <TextField
                  {...register("headquarters.state")}
                  placeholder="Maharashtra"
                  fullWidth
                />
              </Box>

              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Country
                </Typography>
                <TextField
                  {...register("headquarters.country")}
                  placeholder="India"
                  fullWidth
                  value={watch("headquarters.country") || "India"}
                />
              </Box>
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Office Address
              </Typography>
              <TextField
                {...register("headquarters.address")}
                multiline
                rows={2}
                placeholder="Full office address"
                fullWidth
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box className="space-y-6">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Company Email
              </Typography>
              <TextField
                {...register("contact.email")}
                type="email"
                placeholder="info@company.com"
                error={!!errors.contact?.email}
                helperText={errors.contact?.email?.message}
                fullWidth
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                HR Email
              </Typography>
              <TextField
                {...register("contact.hrEmail")}
                type="email"
                placeholder="hr@company.com"
                error={!!errors.contact?.hrEmail}
                helperText={errors.contact?.hrEmail?.message}
                fullWidth
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Phone Number
              </Typography>
              <TextField
                {...register("contact.phone")}
                placeholder="+91 9876543210"
                fullWidth
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box className="min-h-screen bg-grey-50 dark:bg-grey-950 py-8 px-4">
      <Box className="max-w-3xl mx-auto">
        {/* Header */}
        <Box className="text-center mb-8">
          <Box className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Business className="text-primary-600 text-3xl" />
          </Box>
          <Typography variant="h4" className="font-bold text-grey-900 dark:text-white mb-2">
            Set Up Your Company Profile
          </Typography>
          <Typography className="text-grey-600 dark:text-grey-400">
            Complete your company profile to start posting jobs
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} className="mb-8">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  className: activeStep >= index ? "text-primary-600" : "",
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Paper className="p-6 md:p-8 rounded-2xl shadow-sm">
          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <Box className="flex justify-between mt-8 pt-6 border-t border-grey-200 dark:border-grey-700">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle />}
                >
                  Complete Setup
                </Button>
              ) : (
                <Button variant="primary" onClick={handleNext}>
                  Continue
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
