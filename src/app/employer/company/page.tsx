"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Skeleton,
  IconButton,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import {
  Edit,
  Business,
  LocationOn,
  Language,
  People,
  Work,
  CalendarToday,
  Email,
  Phone,
  LinkedIn,
  Twitter,
  CameraAlt,
} from "@mui/icons-material";
import { employerApi } from "@/lib/api/employer";
import { Company } from "@/lib/api/companies";
import { Button } from "@/components/ui/Button";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [company, setCompany] = useState<(Company & { activeJobsCount: number; totalApplications: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await employerApi.getMyCompany();
      if (response.success) {
        setCompany(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch company:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const response = await employerApi.uploadCompanyLogo(file);
      if (response.success) {
        fetchCompany();
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const response = await employerApi.uploadCompanyCover(file);
      if (response.success) {
        fetchCompany();
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload cover image");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box className="space-y-6">
        <Skeleton variant="rounded" height={200} />
        <Skeleton variant="rounded" height={400} />
      </Box>
    );
  }

  if (!company) {
    return (
      <Paper className="p-12 rounded-2xl text-center">
        <Business className="text-grey-300 text-6xl mb-4" />
        <Typography variant="h6" className="text-grey-900 dark:text-white mb-2">
          No Company Profile
        </Typography>
        <Typography className="text-grey-500 mb-6">
          Set up your company profile to start posting jobs
        </Typography>
        <Button
          variant="primary"
          onClick={() => router.push("/employer/company/setup")}
        >
          Set Up Company
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="space-y-6">
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Cover Image & Logo */}
      <Paper className="rounded-2xl overflow-hidden">
        {/* Cover Image */}
        <Box
          className="h-48 md:h-64 bg-gradient-to-r from-primary-600 to-primary-800 relative"
          style={{
            backgroundImage: company.coverImage?.url ? `url(${company.coverImage.url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <IconButton
            className="absolute top-4 right-4 bg-white/80 hover:bg-white"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading}
          >
            <CameraAlt />
          </IconButton>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </Box>

        {/* Company Info Header */}
        <Box className="px-6 pb-6 relative">
          <Box className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
            {/* Logo */}
            <Box className="relative">
              <Avatar
                src={company.logo?.url}
                className="w-32 h-32 border-4 border-white dark:border-grey-900 bg-white shadow-lg"
              >
                <Business className="text-4xl text-grey-400" />
              </Avatar>
              <IconButton
                className="absolute bottom-0 right-0 bg-white shadow-md hover:bg-grey-100"
                size="small"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploading}
              >
                <CameraAlt fontSize="small" />
              </IconButton>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </Box>

            {/* Company Name & Actions */}
            <Box className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 md:pt-0">
              <Box>
                <Box className="flex items-center gap-2">
                  <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                    {company.name}
                  </Typography>
                  {company.isVerified && (
                    <Chip label="Verified" size="small" color="primary" />
                  )}
                </Box>
                <Typography className="text-grey-500">
                  {company.industry} • {company.companyType?.replace("_", " ")}
                </Typography>
              </Box>
              <Button
                variant="outline"
                leftIcon={<Edit />}
                onClick={() => router.push("/employer/company/edit")}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={3}>
        <Grid item xs={6} md={3}>
          <Paper className="p-4 rounded-xl text-center">
            <Typography variant="h4" className="font-bold text-primary-600">
              {company.activeJobsCount || 0}
            </Typography>
            <Typography className="text-grey-500 text-sm">Active Jobs</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper className="p-4 rounded-xl text-center">
            <Typography variant="h4" className="font-bold text-blue-600">
              {company.totalApplications || 0}
            </Typography>
            <Typography className="text-grey-500 text-sm">Applications</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper className="p-4 rounded-xl text-center">
            <Typography variant="h4" className="font-bold text-green-600">
              {company.followersCount || 0}
            </Typography>
            <Typography className="text-grey-500 text-sm">Followers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper className="p-4 rounded-xl text-center">
            <Typography variant="h4" className="font-bold text-orange-600">
              {company.ratings?.overall?.toFixed(1) || "N/A"}
            </Typography>
            <Typography className="text-grey-500 text-sm">Rating</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* About */}
        <Grid item xs={12} md={8}>
          <Paper className="p-6 rounded-2xl">
            <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
              About
            </Typography>
            <Typography className="text-grey-600 dark:text-grey-400 whitespace-pre-line">
              {company.description || "No description provided."}
            </Typography>

            {company.culture?.values && company.culture.values.length > 0 && (
              <Box className="mt-6">
                <Typography className="font-medium text-grey-900 dark:text-white mb-2">
                  Company Values
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {company.culture.values.map((value, index) => (
                    <Chip key={index} label={value} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {company.techStack && company.techStack.length > 0 && (
              <Box className="mt-6">
                <Typography className="font-medium text-grey-900 dark:text-white mb-2">
                  Tech Stack
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {company.techStack.map((tech, index) => (
                    <Chip key={index} label={tech} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {company.benefits && company.benefits.length > 0 && (
              <Box className="mt-6">
                <Typography className="font-medium text-grey-900 dark:text-white mb-2">
                  Benefits & Perks
                </Typography>
                <Box className="grid grid-cols-2 gap-3">
                  {company.benefits.map((benefit: any, index) => (
                    <Box key={index} className="flex items-center gap-2">
                      <Box className="w-2 h-2 rounded-full bg-primary-500" />
                      <Typography className="text-sm text-grey-600 dark:text-grey-400">
                        {benefit.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Company Details */}
        <Grid item xs={12} md={4}>
          <Paper className="p-6 rounded-2xl">
            <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
              Company Details
            </Typography>

            <Box className="space-y-4">
              {company.headquarters?.city && (
                <Box className="flex items-start gap-3">
                  <LocationOn className="text-grey-400 mt-0.5" />
                  <Box>
                    <Typography className="text-sm text-grey-500">Headquarters</Typography>
                    <Typography className="text-grey-900 dark:text-white">
                      {company.headquarters.city}
                      {company.headquarters.state && `, ${company.headquarters.state}`}
                      {company.headquarters.country && `, ${company.headquarters.country}`}
                    </Typography>
                  </Box>
                </Box>
              )}

              {company.companySize && (
                <Box className="flex items-start gap-3">
                  <People className="text-grey-400 mt-0.5" />
                  <Box>
                    <Typography className="text-sm text-grey-500">Company Size</Typography>
                    <Typography className="text-grey-900 dark:text-white">
                      {company.companySize} employees
                    </Typography>
                  </Box>
                </Box>
              )}

              {company.foundedYear && (
                <Box className="flex items-start gap-3">
                  <CalendarToday className="text-grey-400 mt-0.5" />
                  <Box>
                    <Typography className="text-sm text-grey-500">Founded</Typography>
                    <Typography className="text-grey-900 dark:text-white">
                      {company.foundedYear}
                    </Typography>
                  </Box>
                </Box>
              )}

              {company.website && (
                <Box className="flex items-start gap-3">
                  <Language className="text-grey-400 mt-0.5" />
                  <Box>
                    <Typography className="text-sm text-grey-500">Website</Typography>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </Box>
                </Box>
              )}

              <Divider className="my-4" />

              {/* Contact */}
              {company.contact?.email && (
                <Box className="flex items-start gap-3">
                  <Email className="text-grey-400 mt-0.5" />
                  <Box>
                    <Typography className="text-sm text-grey-500">Email</Typography>
                    <a
                      href={`mailto:${company.contact.email}`}
                      className="text-primary-600 hover:underline"
                    >
                      {company.contact.email}
                    </a>
                  </Box>
                </Box>
              )}

              {company.contact?.phone && (
                <Box className="flex items-start gap-3">
                  <Phone className="text-grey-400 mt-0.5" />
                  <Box>
                    <Typography className="text-sm text-grey-500">Phone</Typography>
                    <Typography className="text-grey-900 dark:text-white">
                      {company.contact.phone}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Social Links */}
              {(company.socialLinks?.linkedin || company.socialLinks?.twitter) && (
                <>
                  <Divider className="my-4" />
                  <Box className="flex gap-2">
                    {company.socialLinks?.linkedin && (
                      <IconButton
                        href={company.socialLinks.linkedin}
                        target="_blank"
                        className="bg-blue-50 hover:bg-blue-100"
                      >
                        <LinkedIn className="text-blue-600" />
                      </IconButton>
                    )}
                    {company.socialLinks?.twitter && (
                      <IconButton
                        href={company.socialLinks.twitter}
                        target="_blank"
                        className="bg-sky-50 hover:bg-sky-100"
                      >
                        <Twitter className="text-sky-500" />
                      </IconButton>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
