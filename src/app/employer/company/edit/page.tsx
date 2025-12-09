"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Alert,
  Chip,
  IconButton,
} from "@mui/material";
import { Add, Close, Save, ArrowBack } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { employerApi, CreateCompanyData } from "@/lib/api/employer";

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

export default function EditCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCompanyData>();

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await employerApi.getMyCompany();
      if (response.success && response.data) {
        const company = response.data;
        reset({
          name: company.name,
          industry: company.industry,
          companyType: company.companyType,
          companySize: company.companySize,
          description: company.description,
          shortDescription: company.shortDescription,
          website: company.website,
          foundedYear: company.foundedYear,
          headquarters: company.headquarters,
          contact: company.contact,
        });
        setTechStack(company.techStack || []);
        setValues(company.culture?.values || []);
      }
    } catch (error) {
      console.error("Failed to fetch company:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput("");
    }
  };

  const removeTech = (index: number) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  const addValue = () => {
    if (valueInput.trim() && !values.includes(valueInput.trim())) {
      setValues([...values, valueInput.trim()]);
      setValueInput("");
    }
  };

  const removeValue = (index: number) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateCompanyData) => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        ...data,
        techStack,
        culture: { values },
      };

      const response = await employerApi.updateCompany(updateData as any);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => router.push("/employer/company"), 1500);
      } else {
        setError("Failed to update company profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-[400px]">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box className="max-w-4xl mx-auto">
      <Box className="flex items-center gap-4 mb-6">
        <IconButton onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" className="font-bold text-grey-900 dark:text-white">
          Edit Company Profile
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-6">
          Company profile updated successfully! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info */}
        <Paper className="p-6 rounded-2xl mb-6">
          <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
            Basic Information
          </Typography>

          <Box className="space-y-4">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Company Name
              </Typography>
              <TextField
                {...register("name")}
                fullWidth
                disabled
                helperText="Company name cannot be changed"
              />
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Industry
                </Typography>
                <TextField {...register("industry")} select fullWidth>
                  {industries.map((ind) => (
                    <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Company Type
                </Typography>
                <TextField {...register("companyType")} select fullWidth>
                  {companyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Company Size
                </Typography>
                <TextField {...register("companySize")} select fullWidth>
                  {companySizes.map((size) => (
                    <MenuItem key={size.value} value={size.value}>{size.label}</MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                  Founded Year
                </Typography>
                <TextField
                  {...register("foundedYear", { valueAsNumber: true })}
                  type="number"
                  fullWidth
                />
              </Box>
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Website
              </Typography>
              <TextField {...register("website")} fullWidth placeholder="https://www.company.com" />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Description
              </Typography>
              <TextField
                {...register("description")}
                multiline
                rows={4}
                fullWidth
                placeholder="Tell candidates about your company..."
              />
            </Box>

            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Short Description
              </Typography>
              <TextField
                {...register("shortDescription")}
                fullWidth
                placeholder="A brief tagline for your company"
              />
            </Box>
          </Box>
        </Paper>

        {/* Location */}
        <Paper className="p-6 rounded-2xl mb-6">
          <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
            Headquarters
          </Typography>

          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                City
              </Typography>
              <TextField {...register("headquarters.city")} fullWidth />
            </Box>
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                State
              </Typography>
              <TextField {...register("headquarters.state")} fullWidth />
            </Box>
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Country
              </Typography>
              <TextField {...register("headquarters.country")} fullWidth />
            </Box>
          </Box>

          <Box className="mt-4">
            <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
              Address
            </Typography>
            <TextField {...register("headquarters.address")} fullWidth multiline rows={2} />
          </Box>
        </Paper>

        {/* Contact */}
        <Paper className="p-6 rounded-2xl mb-6">
          <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
            Contact Information
          </Typography>

          <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Company Email
              </Typography>
              <TextField {...register("contact.email")} type="email" fullWidth />
            </Box>
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                HR Email
              </Typography>
              <TextField {...register("contact.hrEmail")} type="email" fullWidth />
            </Box>
            <Box>
              <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                Phone
              </Typography>
              <TextField {...register("contact.phone")} fullWidth />
            </Box>
          </Box>
        </Paper>

        {/* Tech Stack */}
        <Paper className="p-6 rounded-2xl mb-6">
          <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
            Tech Stack
          </Typography>

          <Box className="flex gap-2 mb-3">
            <TextField
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Add technology (e.g. React, Python)"
              fullWidth
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
            />
            <Button variant="outline" onClick={addTech}>
              <Add />
            </Button>
          </Box>

          <Box className="flex flex-wrap gap-2">
            {techStack.map((tech, index) => (
              <Chip
                key={index}
                label={tech}
                onDelete={() => removeTech(index)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>

        {/* Company Values */}
        <Paper className="p-6 rounded-2xl mb-6">
          <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
            Company Values
          </Typography>

          <Box className="flex gap-2 mb-3">
            <TextField
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              placeholder="Add a company value"
              fullWidth
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addValue())}
            />
            <Button variant="outline" onClick={addValue}>
              <Add />
            </Button>
          </Box>

          <Box className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <Chip
                key={index}
                label={value}
                onDelete={() => removeValue(index)}
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>

        {/* Actions */}
        <Box className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={saving} leftIcon={<Save />}>
            Save Changes
          </Button>
        </Box>
      </form>
    </Box>
  );
}
