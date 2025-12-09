"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Add, Close, CheckCircle } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { employerApi, CreateJobData } from "@/lib/api/employer";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(100, "Description must be at least 100 characters"),
  shortDescription: z.string().max(500).optional(),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship", "freelance"]),
  workMode: z.enum(["onsite", "remote", "hybrid"]),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default("India"),
  }),
  experience: z.object({
    min: z.number().min(0),
    max: z.number().optional(),
  }),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default("INR"),
    period: z.enum(["hourly", "monthly", "yearly"]).default("yearly"),
    showSalary: z.boolean().default(true),
    isNegotiable: z.boolean().default(false),
  }),
  skills: z.array(z.object({
    name: z.string(),
    isRequired: z.boolean().default(true),
  })).min(1, "At least one skill is required"),
  education: z.object({
    minQualification: z.string().optional(),
  }).optional(),
  industry: z.string().optional(),
  department: z.string().optional(),
  openings: z.number().min(1).default(1),
  deadline: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

const employmentTypes = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

const workModes = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const qualifications = [
  { value: "any", label: "Any" },
  { value: "10th", label: "10th Pass" },
  { value: "12th", label: "12th Pass" },
  { value: "diploma", label: "Diploma" },
  { value: "graduate", label: "Graduate" },
  { value: "post_graduate", label: "Post Graduate" },
  { value: "phd", label: "PhD" },
];

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
  "Other",
];

const departments = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Customer Support",
  "Other",
];

const steps = ["Basic Info", "Job Details", "Requirements", "Review"];

export default function NewJobPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    trigger,
    watch,
    setValue,
    getValues,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      employmentType: "full_time",
      workMode: "hybrid",
      location: { country: "India" },
      experience: { min: 0 },
      salary: { currency: "INR", period: "yearly", showSalary: true, isNegotiable: false },
      skills: [],
      openings: 1,
      responsibilities: [],
      requirements: [],
      tags: [],
    },
  });

  const skills = watch("skills") || [];
  const responsibilities = watch("responsibilities") || [];
  const requirements = watch("requirements") || [];
  const workMode = watch("workMode");

  const addSkill = () => {
    if (skillInput.trim() && !skills.find((s) => s.name.toLowerCase() === skillInput.toLowerCase())) {
      setValue("skills", [...skills, { name: skillInput.trim(), isRequired: true }]);
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setValue("skills", skills.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      setValue("responsibilities", [...responsibilities, responsibilityInput.trim()]);
      setResponsibilityInput("");
    }
  };

  const removeResponsibility = (index: number) => {
    setValue("responsibilities", responsibilities.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setValue("requirements", [...requirements, requirementInput.trim()]);
      setRequirementInput("");
    }
  };

  const removeRequirement = (index: number) => {
    setValue("requirements", requirements.filter((_, i) => i !== index));
  };

  const validateStep = async () => {
    let fieldsToValidate: (keyof JobFormData)[] = [];
    
    switch (activeStep) {
      case 0:
        fieldsToValidate = ["title", "employmentType", "workMode", "location"];
        break;
      case 1:
        fieldsToValidate = ["description", "experience", "salary"];
        break;
      case 2:
        fieldsToValidate = ["skills"];
        break;
    }
    
    return await trigger(fieldsToValidate);
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

  const onSubmit = async (data: JobFormData) => {
    setError(null);
    try {
      const response = await employerApi.createJob(data as CreateJobData);
      if (response.success) {
        router.push("/employer/jobs");
      } else {
        setError("Failed to create job. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create job");
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box className="space-y-6">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Job Title *
              </Typography>
              <TextField
                {...register("title")}
                placeholder="e.g. Senior Software Engineer"
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
              />
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Employment Type *
                </Typography>
                <TextField
                  {...register("employmentType")}
                  select
                  error={!!errors.employmentType}
                  helperText={errors.employmentType?.message}
                  fullWidth
                >
                  {employmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Work Mode *
                </Typography>
                <TextField
                  {...register("workMode")}
                  select
                  error={!!errors.workMode}
                  helperText={errors.workMode?.message}
                  fullWidth
                >
                  {workModes.map((mode) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {workMode !== "remote" && (
              <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Box>
                  <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                    City
                  </Typography>
                  <TextField
                    {...register("location.city")}
                    placeholder="Mumbai"
                    fullWidth
                  />
                </Box>
                <Box>
                  <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                    State
                  </Typography>
                  <TextField
                    {...register("location.state")}
                    placeholder="Maharashtra"
                    fullWidth
                  />
                </Box>
                <Box>
                  <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                    Country
                  </Typography>
                  <TextField
                    {...register("location.country")}
                    placeholder="India"
                    fullWidth
                  />
                </Box>
              </Box>
            )}

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Industry
                </Typography>
                <TextField {...register("industry")} select fullWidth defaultValue="">
                  <MenuItem value="">Select Industry</MenuItem>
                  {industries.map((ind) => (
                    <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Department
                </Typography>
                <TextField {...register("department")} select fullWidth defaultValue="">
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Number of Openings
                </Typography>
                <TextField
                  {...register("openings", { valueAsNumber: true })}
                  type="number"
                  fullWidth
                />
              </Box>
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Application Deadline
                </Typography>
                <TextField
                  {...register("deadline")}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box className="space-y-6">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Job Description *
              </Typography>
              <TextField
                {...register("description")}
                multiline
                rows={6}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Short Description (for job cards)
              </Typography>
              <TextField
                {...register("shortDescription")}
                multiline
                rows={2}
                placeholder="A brief summary of the role"
                error={!!errors.shortDescription}
                helperText={errors.shortDescription?.message}
                fullWidth
              />
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Min Experience (years) *
                </Typography>
                <TextField
                  {...register("experience.min", { valueAsNumber: true })}
                  type="number"
                  error={!!errors.experience?.min}
                  helperText={errors.experience?.min?.message}
                  fullWidth
                />
              </Box>
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Max Experience (years)
                </Typography>
                <TextField
                  {...register("experience.max", { valueAsNumber: true })}
                  type="number"
                  fullWidth
                />
              </Box>
            </Box>

            <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300">
              Salary Range
            </Typography>
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Box>
                <TextField
                  {...register("salary.min", { valueAsNumber: true })}
                  type="number"
                  placeholder="Min Salary"
                  fullWidth
                />
              </Box>
              <Box>
                <TextField
                  {...register("salary.max", { valueAsNumber: true })}
                  type="number"
                  placeholder="Max Salary"
                  fullWidth
                />
              </Box>
              <Box>
                <TextField {...register("salary.period")} select fullWidth>
                  <MenuItem value="yearly">Per Year</MenuItem>
                  <MenuItem value="monthly">Per Month</MenuItem>
                  <MenuItem value="hourly">Per Hour</MenuItem>
                </TextField>
              </Box>
            </Box>

            <Box className="flex gap-4">
              <Controller
                name="salary.showSalary"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Show salary on job listing"
                  />
                )}
              />
              <Controller
                name="salary.isNegotiable"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Salary is negotiable"
                  />
                )}
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Minimum Qualification
              </Typography>
              <TextField {...register("education.minQualification")} select fullWidth defaultValue="any">
                {qualifications.map((qual) => (
                  <MenuItem key={qual.value} value={qual.value}>{qual.label}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box className="space-y-6">
            {/* Skills */}
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Required Skills *
              </Typography>
              <Box className="flex gap-2 mb-3">
                <TextField
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g. React, Python)"
                  fullWidth
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button variant="outline" onClick={addSkill}>
                  <Add />
                </Button>
              </Box>
              {errors.skills && (
                <Typography className="text-error-500 text-sm mb-2">
                  {errors.skills.message}
                </Typography>
              )}
              <Box className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill.name}
                    onDelete={() => removeSkill(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {/* Responsibilities */}
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Key Responsibilities
              </Typography>
              <Box className="flex gap-2 mb-3">
                <TextField
                  value={responsibilityInput}
                  onChange={(e) => setResponsibilityInput(e.target.value)}
                  placeholder="Add a responsibility"
                  fullWidth
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())}
                />
                <Button variant="outline" onClick={addResponsibility}>
                  <Add />
                </Button>
              </Box>
              <Box className="space-y-2">
                {responsibilities.map((resp, index) => (
                  <Box key={index} className="flex items-center gap-2 p-2 bg-grey-50 dark:bg-grey-800 rounded-lg">
                    <Typography className="flex-1 text-sm">{resp}</Typography>
                    <IconButton size="small" onClick={() => removeResponsibility(index)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Requirements */}
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Requirements
              </Typography>
              <Box className="flex gap-2 mb-3">
                <TextField
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  placeholder="Add a requirement"
                  fullWidth
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                />
                <Button variant="outline" onClick={addRequirement}>
                  <Add />
                </Button>
              </Box>
              <Box className="space-y-2">
                {requirements.map((req, index) => (
                  <Box key={index} className="flex items-center gap-2 p-2 bg-grey-50 dark:bg-grey-800 rounded-lg">
                    <Typography className="flex-1 text-sm">{req}</Typography>
                    <IconButton size="small" onClick={() => removeRequirement(index)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        );

      case 3:
        const formData = getValues();
        return (
          <Box className="space-y-6">
            <Alert severity="info">
              Review your job posting before publishing. You can edit it later if needed.
            </Alert>

            <Paper className="p-6 rounded-xl bg-grey-50 dark:bg-grey-800">
              <Typography variant="h5" className="font-bold text-grey-900 dark:text-white mb-4">
                {formData.title}
              </Typography>

              <Box className="flex flex-wrap gap-2 mb-4">
                <Chip label={formData.employmentType?.replace("_", " ")} className="capitalize" />
                <Chip label={formData.workMode} className="capitalize" />
                {formData.location?.city && (
                  <Chip label={`${formData.location.city}, ${formData.location.country}`} />
                )}
              </Box>

              <Typography className="text-grey-600 dark:text-grey-400 mb-4">
                {formData.description?.substring(0, 300)}...
              </Typography>

              <Box className="grid grid-cols-2 gap-4 mb-4">
                <Box>
                  <Typography className="text-sm text-grey-500">Experience</Typography>
                  <Typography className="font-medium">
                    {formData.experience?.min} - {formData.experience?.max || "Any"} years
                  </Typography>
                </Box>
                <Box>
                  <Typography className="text-sm text-grey-500">Salary</Typography>
                  <Typography className="font-medium">
                    {formData.salary?.showSalary
                      ? `₹${formData.salary?.min?.toLocaleString()} - ₹${formData.salary?.max?.toLocaleString()} ${formData.salary?.period}`
                      : "Not disclosed"}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="text-sm text-grey-500">Openings</Typography>
                  <Typography className="font-medium">{formData.openings}</Typography>
                </Box>
                <Box>
                  <Typography className="text-sm text-grey-500">Deadline</Typography>
                  <Typography className="font-medium">
                    {formData.deadline || "No deadline"}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography className="text-sm text-grey-500 mb-2">Skills Required</Typography>
                <Box className="flex flex-wrap gap-2">
                  {formData.skills?.map((skill, i) => (
                    <Chip key={i} label={skill.name} size="small" />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box className="max-w-4xl mx-auto">
      <Typography variant="h5" className="font-bold text-grey-900 dark:text-white mb-6">
        Post a New Job
      </Typography>

      <Stepper activeStep={activeStep} className="mb-8">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper className="p-6 md:p-8 rounded-2xl">
        {error && (
          <Alert severity="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

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
                Publish Job
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
  );
}
