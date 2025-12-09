"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMyApplications } from "@/lib/api/hooks/useJobs";
import { useAuthStore } from "@/store/authStore";
import { useRoleBasedRedirect } from "@/hooks/useRoleBasedRedirect";
import { Application } from "@/lib/api/jobs";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Chip,
  Skeleton,
  Avatar,
  Box,
} from "@mui/material";
import {
  Work,
  Schedule,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Business,
  LocationOn,
  CalendarToday,
} from "@mui/icons-material";
import { formatDistanceToNow, format } from "date-fns";

const statusConfig: Record<string, { color: "default" | "primary" | "success" | "warning" | "error" | "info"; icon: React.ReactNode; label: string }> = {
  pending: { color: "warning", icon: <HourglassEmpty fontSize="small" />, label: "Pending Review" },
  reviewing: { color: "info", icon: <Schedule fontSize="small" />, label: "Under Review" },
  shortlisted: { color: "primary", icon: <CheckCircle fontSize="small" />, label: "Shortlisted" },
  interview_scheduled: { color: "success", icon: <CalendarToday fontSize="small" />, label: "Interview Scheduled" },
  offered: { color: "success", icon: <CheckCircle fontSize="small" />, label: "Offer Received" },
  rejected: { color: "error", icon: <Cancel fontSize="small" />, label: "Not Selected" },
  withdrawn: { color: "default", icon: <Cancel fontSize="small" />, label: "Withdrawn" },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isLoading: authLoading } = useRoleBasedRedirect();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);

  const statusFilter = activeTab === 0 ? undefined : 
    activeTab === 1 ? "pending,reviewing" :
    activeTab === 2 ? "shortlisted,interview_scheduled" :
    activeTab === 3 ? "offered" :
    "rejected,withdrawn";

  const { data, isLoading, refetch } = useMyApplications(page, 10, statusFilter);
  const applications = data?.data || [];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
          <Container maxWidth="lg" className="py-10">
            <Box className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={120} />
              ))}
            </Box>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || { color: "default" as const, icon: <Work fontSize="small" />, label: status };
  };

  const renderApplicationCard = (application: Application) => {
    const job = application.job;
    const statusInfo = getStatusInfo(application.status);
    const companyName = typeof job.company === 'string' ? job.company : job.company?.name;
    const companyLogo = typeof job.company === 'object' ? job.company?.logo?.url : undefined;
    const location = typeof job.location === 'string' ? job.location : 
      job.location?.city ? `${job.location.city}${job.location.state ? `, ${job.location.state}` : ''}` : 'Remote';

    return (
      <Card key={application._id} className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="w-10 h-10 object-contain" />
            ) : (
              <Business className="text-primary-600 text-2xl" />
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white line-clamp-1">
                  {job.title}
                </Typography>
                <Typography variant="body2" className="text-grey-600 dark:text-grey-400">
                  {companyName}
                </Typography>
              </div>
              <Chip
                icon={statusInfo.icon}
                label={statusInfo.label}
                color={statusInfo.color}
                size="small"
                className="flex-shrink-0"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-grey-500">
              <div className="flex items-center gap-1">
                <LocationOn fontSize="small" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarToday fontSize="small" />
                <span>Applied {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Interview Info */}
            {application.interviews && application.interviews.length > 0 && (
              <div className="mt-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
                <Typography variant="body2" className="font-medium text-success-700 dark:text-success-300">
                  📅 Interview Scheduled
                </Typography>
                <Typography variant="caption" className="text-success-600 dark:text-success-400">
                  {format(new Date(application.interviews[0].scheduledAt), "PPP 'at' p")}
                </Typography>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="small"
                onClick={() => router.push(`/jobs?id=${job._id}`)}
              >
                View Job
              </Button>
              {application.status === 'pending' && (
                <Button
                  variant="outline"
                  size="small"
                  className="text-error-600 border-error-300"
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        <Container maxWidth="lg" className="py-10">
          <Typography
            variant="h4"
            className="font-semibold mb-2 text-grey-900 dark:text-white"
          >
            My Applications
          </Typography>
          <Typography variant="body1" className="text-grey-600 dark:text-grey-400 mb-6">
            Track the status of your job applications
          </Typography>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => { setActiveTab(v); setPage(1); }}
            className="mb-6 border-b border-grey-200 dark:border-grey-700"
          >
            <Tab label="All" />
            <Tab label="In Progress" />
            <Tab label="Interviews" />
            <Tab label="Offers" />
            <Tab label="Closed" />
          </Tabs>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <Typography variant="h4" className="font-bold text-primary-600">
                {data?.total || 0}
              </Typography>
              <Typography variant="body2" className="text-grey-600">
                Total Applications
              </Typography>
            </Card>
            <Card className="p-4 text-center">
              <Typography variant="h4" className="font-bold text-warning-600">
                {applications.filter(a => ['pending', 'reviewing'].includes(a.status)).length}
              </Typography>
              <Typography variant="body2" className="text-grey-600">
                In Progress
              </Typography>
            </Card>
            <Card className="p-4 text-center">
              <Typography variant="h4" className="font-bold text-success-600">
                {applications.filter(a => a.status === 'interview_scheduled').length}
              </Typography>
              <Typography variant="body2" className="text-grey-600">
                Interviews
              </Typography>
            </Card>
            <Card className="p-4 text-center">
              <Typography variant="h4" className="font-bold text-accent-600">
                {applications.filter(a => a.status === 'offered').length}
              </Typography>
              <Typography variant="body2" className="text-grey-600">
                Offers
              </Typography>
            </Card>
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={150} className="rounded-lg" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <Card className="p-10 text-center">
              <Work className="text-6xl text-grey-300 mb-4" />
              <Typography variant="h6" className="text-grey-600 dark:text-grey-400 mb-2">
                No applications yet
              </Typography>
              <Typography variant="body2" className="text-grey-500 mb-4">
                Start applying to jobs to track your applications here
              </Typography>
              <Button variant="primary" onClick={() => router.push("/jobs")}>
                Browse Jobs
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map(renderApplicationCard)}
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-grey-600">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}
