"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Skeleton,
  MenuItem,
  Select,
  FormControl,
  Container,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  People,
  Work,
  CheckCircle,
  Schedule,
  PersonAdd,
} from "@mui/icons-material";
import { employerApi, AnalyticsData } from "@/lib/api/employer";
import { useAnalytics } from "@/lib/api/hooks/useEmployer";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const { data: analytics, isLoading } = useAnalytics(period);

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
        <Skeleton variant="rounded" height={300} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  const funnel = analytics?.conversionFunnel || {
    total: 0,
    viewed: 0,
    shortlisted: 0,
    interviewed: 0,
    hired: 0,
  };

  const conversionRate = funnel.total > 0 
    ? ((funnel.hired / funnel.total) * 100).toFixed(1) 
    : "0";

  return (
    <Container maxWidth="lg" className="py-10">
      <Box className="space-y-6">
        {/* Header */}
        <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Box>
            <Typography variant="h4" className="font-semibold text-grey-900 dark:text-white">
              Analytics
            </Typography>
          <Typography className="text-grey-500">
            Track your recruitment performance and metrics
          </Typography>
        </Box>
        <FormControl size="small">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as number)}
            className="min-w-[150px]"
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
            <MenuItem value={365}>Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-5 rounded-2xl">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography className="text-grey-500 text-sm mb-1">
                  Total Views
                </Typography>
                <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                  {analytics?.jobStats?.totalViews?.toLocaleString() || 0}
                </Typography>
              </Box>
              <Box className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Visibility className="text-blue-600" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-5 rounded-2xl">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography className="text-grey-500 text-sm mb-1">
                  Total Applications
                </Typography>
                <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                  {funnel.total}
                </Typography>
              </Box>
              <Box className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <People className="text-purple-600" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-5 rounded-2xl">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography className="text-grey-500 text-sm mb-1">
                  Total Hired
                </Typography>
                <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                  {funnel.hired}
                </Typography>
              </Box>
              <Box className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <PersonAdd className="text-green-600" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-5 rounded-2xl">
            <Box className="flex items-center justify-between">
              <Box>
                <Typography className="text-grey-500 text-sm mb-1">
                  Conversion Rate
                </Typography>
                <Typography variant="h4" className="font-bold text-grey-900 dark:text-white">
                  {conversionRate}%
                </Typography>
              </Box>
              <Box className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-orange-600" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Conversion Funnel */}
      <Paper className="p-6 rounded-2xl">
        <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-6">
          Hiring Funnel
        </Typography>
        <Box className="space-y-4">
          {[
            { label: "Applications Received", value: funnel.total, color: "bg-blue-500" },
            { label: "Viewed by Recruiter", value: funnel.viewed, color: "bg-purple-500" },
            { label: "Shortlisted", value: funnel.shortlisted, color: "bg-yellow-500" },
            { label: "Interviewed", value: funnel.interviewed, color: "bg-orange-500" },
            { label: "Hired", value: funnel.hired, color: "bg-green-500" },
          ].map((stage, index) => {
            const percentage = funnel.total > 0 ? (stage.value / funnel.total) * 100 : 0;
            return (
              <Box key={stage.label}>
                <Box className="flex items-center justify-between mb-2">
                  <Typography className="text-sm text-grey-600 dark:text-grey-400">
                    {stage.label}
                  </Typography>
                  <Typography className="text-sm font-medium text-grey-900 dark:text-white">
                    {stage.value} ({percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <Box className="h-3 bg-grey-100 dark:bg-grey-800 rounded-full overflow-hidden">
                  <Box
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Applications Over Time */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6 rounded-2xl h-full">
            <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
              Applications Over Time
            </Typography>
            {analytics?.applicationsOverTime && analytics.applicationsOverTime.length > 0 ? (
              <Box className="space-y-3">
                {analytics.applicationsOverTime.slice(-10).map((item) => (
                  <Box key={item._id} className="flex items-center gap-3">
                    <Typography className="text-sm text-grey-500 w-24">
                      {new Date(item._id).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Typography>
                    <Box className="flex-1 h-6 bg-grey-100 dark:bg-grey-800 rounded overflow-hidden">
                      <Box
                        className="h-full bg-primary-500 rounded"
                        style={{
                          width: `${Math.min(
                            (item.count / Math.max(...analytics.applicationsOverTime.map((a) => a.count))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </Box>
                    <Typography className="text-sm font-medium w-8 text-right">
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box className="flex items-center justify-center h-48 text-grey-400">
                No data available for this period
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Top Performing Jobs */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6 rounded-2xl h-full">
            <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
              Top Performing Jobs
            </Typography>
            {analytics?.topJobs && analytics.topJobs.length > 0 ? (
              <Box className="space-y-4">
                {analytics.topJobs.map((job: any, index) => (
                  <Box
                    key={job._id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-grey-50 dark:bg-grey-800"
                  >
                    <Box className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Typography className="font-bold text-primary-600">
                        {index + 1}
                      </Typography>
                    </Box>
                    <Box className="flex-1 min-w-0">
                      <Typography className="font-medium text-grey-900 dark:text-white truncate">
                        {job.title}
                      </Typography>
                      <Box className="flex items-center gap-4 text-sm text-grey-500">
                        <span>{job.stats?.views || 0} views</span>
                        <span>{job.stats?.applications || 0} applications</span>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box className="flex items-center justify-center h-48 text-grey-400">
                No jobs data available
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Source Breakdown */}
      <Paper className="p-6 rounded-2xl">
        <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-4">
          Application Sources
        </Typography>
        {analytics?.sourceBreakdown && Object.keys(analytics.sourceBreakdown).length > 0 ? (
          <Box className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(analytics.sourceBreakdown).map(([source, count]) => (
              <Box
                key={source}
                className="p-4 rounded-xl bg-grey-50 dark:bg-grey-800 text-center"
              >
                <Typography variant="h5" className="font-bold text-grey-900 dark:text-white">
                  {count}
                </Typography>
                <Typography className="text-sm text-grey-500 capitalize">
                  {source.replace("_", " ")}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box className="flex items-center justify-center h-24 text-grey-400">
            No source data available
          </Box>
        )}
        </Paper>
      </Box>
    </Container>
  );
}
