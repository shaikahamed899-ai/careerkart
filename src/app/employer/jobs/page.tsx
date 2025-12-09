"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from "@mui/material";
import {
  Add,
  MoreVert,
  Visibility,
  People,
  Edit,
  Delete,
  Pause,
  PlayArrow,
  LocationOn,
  Work,
  AccessTime,
} from "@mui/icons-material";
import { employerApi } from "@/lib/api/employer";
import { useMyJobs, useUpdateJobStatus, useDeleteJob } from "@/lib/api/hooks/useEmployer";
import { Job } from "@/lib/api/jobs";
import { Button } from "@/components/ui/Button";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  closed: "bg-grey-100 text-grey-700",
  draft: "bg-blue-100 text-blue-700",
  expired: "bg-red-100 text-red-700",
  filled: "bg-purple-100 text-purple-700",
};

export default function EmployerJobsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { data: jobs = [], isLoading, error } = useMyJobs(1, 50, activeTab === "all" ? undefined : activeTab);
  const updateJobStatusMutation = useUpdateJobStatus();
  const deleteJobMutation = useDeleteJob();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: Job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedJob) return;
    
    try {
      await updateJobStatusMutation.mutateAsync({ jobId: selectedJob._id, status });
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    
    try {
      await deleteJobMutation.mutateAsync(selectedJob._id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
    handleMenuClose();
  };

  const formatSalary = (job: Job) => {
    if (!job.salary?.showSalary || (!job.salary?.min && !job.salary?.max)) {
      return "Not disclosed";
    }
    const min = job.salary.min ? `₹${(job.salary.min / 100000).toFixed(1)}L` : "";
    const max = job.salary.max ? `₹${(job.salary.max / 100000).toFixed(1)}L` : "";
    return min && max ? `${min} - ${max}` : min || max;
  };

  return (
    <Container maxWidth="lg" className="py-10">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Box>
          <Typography variant="h4" className="font-semibold text-grey-900 dark:text-white">
            Job Postings
          </Typography>
          <Typography className="text-grey-500">
            Manage your job listings and track applications
          </Typography>
        </Box>
        <Button
          variant="primary"
          leftIcon={<Add />}
          onClick={() => router.push("/employer/jobs/new")}
        >
          Post New Job
        </Button>
      </Box>

      {/* Tabs */}
      <Paper className="mb-6 rounded-xl">
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          className="border-b border-grey-200 dark:border-grey-700"
        >
          <Tab label="All Jobs" value="all" />
          <Tab label="Active" value="active" />
          <Tab label="Paused" value="paused" />
          <Tab label="Closed" value="closed" />
          <Tab label="Draft" value="draft" />
        </Tabs>
      </Paper>

      {/* Jobs List */}
      {isLoading ? (
        <Box className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={150} />
          ))}
        </Box>
      ) : jobs.length === 0 ? (
        <Paper className="p-12 rounded-2xl text-center">
          <Work className="text-grey-300 text-6xl mb-4" />
          <Typography variant="h6" className="text-grey-900 dark:text-white mb-2">
            No jobs found
          </Typography>
          <Typography className="text-grey-500 mb-6">
            {activeTab === "all"
              ? "You haven't posted any jobs yet. Start by creating your first job posting."
              : `No ${activeTab} jobs found.`}
          </Typography>
          {activeTab === "all" && (
            <Button
              variant="primary"
              leftIcon={<Add />}
              onClick={() => router.push("/employer/jobs/new")}
            >
              Post Your First Job
            </Button>
          )}
        </Paper>
      ) : (
        <Box className="space-y-4">
          {jobs.map((job) => (
            <Paper
              key={job._id}
              className="p-5 rounded-2xl hover:shadow-md transition-shadow"
            >
              <Box className="flex items-start justify-between">
                <Box className="flex-1">
                  <Box className="flex items-center gap-3 mb-2">
                    <Typography
                      variant="h6"
                      className="font-semibold text-grey-900 dark:text-white cursor-pointer hover:text-primary-600"
                      onClick={() => router.push(`/employer/jobs/${job._id}`)}
                    >
                      {job.title}
                    </Typography>
                    <Chip
                      label={job.status}
                      size="small"
                      className={`capitalize ${statusColors[job.status] || "bg-grey-100"}`}
                    />
                  </Box>

                  <Box className="flex flex-wrap items-center gap-4 text-sm text-grey-500 mb-3">
                    <Box className="flex items-center gap-1">
                      <Work fontSize="small" />
                      {job.employmentType?.replace("_", " ")}
                    </Box>
                    <Box className="flex items-center gap-1">
                      <LocationOn fontSize="small" />
                      {job.workMode === "remote"
                        ? "Remote"
                        : `${job.location?.city || "Location not specified"}`}
                    </Box>
                    <Box className="flex items-center gap-1">
                      <AccessTime fontSize="small" />
                      Posted {new Date(job.createdAt || job.postedAt).toLocaleDateString()}
                    </Box>
                  </Box>

                  <Box className="flex items-center gap-6">
                    <Box className="flex items-center gap-2 text-grey-600">
                      <Visibility fontSize="small" />
                      <Typography className="text-sm">
                        {job.stats?.views || 0} views
                      </Typography>
                    </Box>
                    <Box className="flex items-center gap-2 text-grey-600">
                      <People fontSize="small" />
                      <Typography className="text-sm">
                        {job.stats?.applications || 0} applications
                      </Typography>
                    </Box>
                    <Typography className="text-sm text-grey-500">
                      {formatSalary(job)} / year
                    </Typography>
                  </Box>
                </Box>

                <Box className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => router.push(`/employer/jobs/${job._id}/applications`)}
                  >
                    View Applications
                  </Button>
                  <IconButton onClick={(e) => handleMenuOpen(e, job)}>
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <Box className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-grey-100 dark:border-grey-800">
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <Chip
                      key={index}
                      label={typeof skill === "string" ? skill : skill.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {job.skills.length > 5 && (
                    <Chip
                      label={`+${job.skills.length - 5} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Job Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          router.push(`/employer/jobs/${selectedJob?._id}/edit`);
          handleMenuClose();
        }}>
          <Edit fontSize="small" className="mr-2" />
          Edit Job
        </MenuItem>
        {selectedJob?.status === "active" ? (
          <MenuItem onClick={() => handleStatusChange("paused")}>
            <Pause fontSize="small" className="mr-2" />
            Pause Job
          </MenuItem>
        ) : selectedJob?.status === "paused" ? (
          <MenuItem onClick={() => handleStatusChange("active")}>
            <PlayArrow fontSize="small" className="mr-2" />
            Activate Job
          </MenuItem>
        ) : null}
        <MenuItem onClick={() => handleStatusChange("closed")}>
          <Visibility fontSize="small" className="mr-2" />
          Close Job
        </MenuItem>
        <MenuItem
          onClick={() => setDeleteDialogOpen(true)}
          className="text-error-600"
        >
          <Delete fontSize="small" className="mr-2" />
          Delete Job
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Job?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{selectedJob?.title}&quot;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            className="bg-error-600 hover:bg-error-700"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
