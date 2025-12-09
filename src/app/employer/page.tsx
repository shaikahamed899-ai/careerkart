"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Skeleton,
  IconButton,
  Container,
} from "@mui/material";
import {
  Work,
  People,
  Visibility,
  TrendingUp,
  ArrowForward,
  AccessTime,
  CheckCircle,
  Schedule,
  PersonAdd,
} from "@mui/icons-material";
import { employerApi, DashboardData } from "@/lib/api/employer";
import { useDashboard } from "@/lib/api/hooks/useEmployer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  viewed: "bg-purple-100 text-purple-700",
  shortlisted: "bg-green-100 text-green-700",
  interview_scheduled: "bg-orange-100 text-orange-700",
  rejected: "bg-red-100 text-red-700",
  hired: "bg-emerald-100 text-emerald-700",
};

const jobStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  closed: "bg-grey-100 text-grey-700",
  draft: "bg-blue-100 text-blue-700",
};

export default function EmployerDashboardPage() {
  const router = useRouter();
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Container maxWidth="lg" className="py-10">
        <Box className="space-y-6">
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={120} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rounded" height={400} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rounded" height={400} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  const stats = dashboard?.stats || {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    shortlistedCount: 0,
    interviewsScheduled: 0,
    hiredCount: 0,
  };

  return (
    <Container maxWidth="lg" className="py-10">
      <Typography
        variant="h4"
        className="font-semibold mb-6 text-grey-900 dark:text-white"
      >
        Dashboard
      </Typography>
      
      <Box className="space-y-6">
        {/* Stats Cards */}
        <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-5 rounded-2xl hover:shadow-md transition-shadow">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography className="text-grey-500 text-sm mb-1">
                  Active Jobs
                </Typography>
                <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                  {stats.activeJobs}
                </Typography>
                <Typography className="text-grey-500 text-xs mt-1">
                  of {stats.totalJobs} total
                </Typography>
              </Box>
              <Box className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <Work className="text-primary-600" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-5 rounded-2xl hover:shadow-md transition-shadow">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography className="text-grey-500 text-sm mb-1">
                  Total Applications
                </Typography>
                <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                  {stats.totalApplications}
                </Typography>
                <Typography className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp fontSize="small" />
                  +{stats.newApplications} this week
                </Typography>
              </Box>
              <Box className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <People className="text-blue-600" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-5 rounded-2xl hover:shadow-md transition-shadow">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography className="text-grey-500 text-sm mb-1">
                  Interviews Scheduled
                </Typography>
                <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                  {stats.interviewsScheduled}
                </Typography>
                <Typography className="text-grey-500 text-xs mt-1">
                  {stats.shortlistedCount} shortlisted
                </Typography>
              </Box>
              <Box className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Schedule className="text-orange-600" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-5 rounded-2xl hover:shadow-md transition-shadow">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography className="text-grey-500 text-sm mb-1">
                  Total Hired
                </Typography>
                <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                  {stats.hiredCount}
                </Typography>
                <Typography className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle fontSize="small" />
                  Great progress!
                </Typography>
              </Box>
              <Box className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <PersonAdd className="text-green-600" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Applications */}
        <Grid item xs={12} lg={8}>
          <Paper className="rounded-2xl overflow-hidden">
            <Box className="p-5 border-b border-grey-200 dark:border-grey-700 flex items-center justify-between">
              <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white">
                Recent Applications
              </Typography>
              <Button
                variant="text"
                rightIcon={<ArrowForward />}
                onClick={() => router.push("/employer/applications")}
              >
                View All
              </Button>
            </Box>

            <Box className="divide-y divide-grey-100 dark:divide-grey-800">
              {dashboard?.recentApplications?.length === 0 ? (
                <Box className="p-8 text-center">
                  <People className="text-grey-300 text-5xl mb-3" />
                  <Typography className="text-grey-500">
                    No applications yet. Post a job to start receiving applications.
                  </Typography>
                </Box>
              ) : (
                dashboard?.recentApplications?.map((application: any) => (
                  <Box
                    key={application._id}
                    className="p-4 hover:bg-grey-50 dark:hover:bg-grey-800/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/employer/applications/${application._id}`)}
                  >
                    <Box className="flex items-center gap-4">
                      <Avatar
                        src={application.applicant?.avatar}
                        className="w-12 h-12 bg-primary-100 text-primary-600"
                      >
                        {application.applicant?.name?.charAt(0)}
                      </Avatar>
                      <Box className="flex-1 min-w-0">
                        <Typography className="font-medium text-grey-900 dark:text-white">
                          {application.applicant?.name}
                        </Typography>
                        <Typography className="text-sm text-grey-500 truncate">
                          {application.applicant?.profile?.headline || application.applicant?.email}
                        </Typography>
                        <Typography className="text-xs text-grey-400 mt-1">
                          Applied for: {application.job?.title}
                        </Typography>
                      </Box>
                      <Box className="text-right">
                        <Chip
                          label={application.status?.replace("_", " ")}
                          size="small"
                          className={`capitalize ${statusColors[application.status] || "bg-grey-100"}`}
                        />
                        <Typography className="text-xs text-grey-400 mt-2">
                          <AccessTime fontSize="inherit" className="mr-1" />
                          {new Date(application.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Jobs */}
        <Grid item xs={12} lg={4}>
          <Paper className="rounded-2xl overflow-hidden">
            <Box className="p-5 border-b border-grey-200 dark:border-grey-700 flex items-center justify-between">
              <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white">
                Your Jobs
              </Typography>
              <Button
                variant="text"
                rightIcon={<ArrowForward />}
                onClick={() => router.push("/employer/jobs")}
              >
                View All
              </Button>
            </Box>

            <Box className="divide-y divide-grey-100 dark:divide-grey-800">
              {dashboard?.recentJobs?.length === 0 ? (
                <Box className="p-8 text-center">
                  <Work className="text-grey-300 text-5xl mb-3" />
                  <Typography className="text-grey-500 mb-4">
                    No jobs posted yet
                  </Typography>
                  <Button
                    variant="primary"
                    onClick={() => router.push("/employer/jobs/new")}
                  >
                    Post Your First Job
                  </Button>
                </Box>
              ) : (
                dashboard?.recentJobs?.map((job: any) => (
                  <Box
                    key={job._id}
                    className="p-4 hover:bg-grey-50 dark:hover:bg-grey-800/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/employer/jobs/${job._id}`)}
                  >
                    <Box className="flex items-start justify-between mb-2">
                      <Typography className="font-medium text-grey-900 dark:text-white line-clamp-1">
                        {job.title}
                      </Typography>
                      <Chip
                        label={job.status}
                        size="small"
                        className={`capitalize ml-2 ${jobStatusColors[job.status] || "bg-grey-100"}`}
                      />
                    </Box>
                    <Box className="flex items-center gap-4 text-sm text-grey-500">
                      <Box className="flex items-center gap-1">
                        <Visibility fontSize="small" />
                        {job.stats?.views || 0} views
                      </Box>
                      <Box className="flex items-center gap-1">
                        <People fontSize="small" />
                        {job.stats?.applications || 0} applications
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>

          {/* Quick Actions */}
          <Paper className="rounded-2xl p-5 mt-4">
            <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
              Quick Actions
            </Typography>
            <Box className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => router.push("/employer/jobs/new")}
                className="justify-start"
                leftIcon={<Work />}
              >
                Post New Job
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => router.push("/employer/company")}
                className="justify-start"
                leftIcon={<Visibility />}
              >
                Edit Company Profile
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => router.push("/employer/analytics")}
                className="justify-start"
                leftIcon={<TrendingUp />}
              >
                View Analytics
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Application Status Overview */}
      {dashboard?.applicationsByStatus && Object.keys(dashboard.applicationsByStatus).length > 0 && (
        <Paper className="rounded-2xl p-5">
          <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
            Application Pipeline
          </Typography>
          <Box className="flex flex-wrap gap-3">
            {Object.entries(dashboard.applicationsByStatus).map(([status, count]) => (
              <Box
                key={status}
                className="flex-1 min-w-[120px] p-4 rounded-xl bg-grey-50 dark:bg-grey-800 text-center"
              >
                <Typography variant="h5" className="font-bold text-grey-900 dark:text-white">
                  {count}
                </Typography>
                <Typography className="text-sm text-grey-500 capitalize">
                  {status.replace("_", " ")}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
      </Box>
    </Container>
  );
}
