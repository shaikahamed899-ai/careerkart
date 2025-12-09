"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Skeleton,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MUITextField,
  Container,
} from "@mui/material";
import {
  MoreVert,
  Email,
  Phone,
  Download,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
  Work,
  AccessTime,
  FilterList,
} from "@mui/icons-material";
import { employerApi, ApplicationWithApplicant } from "@/lib/api/employer";
import { useAllApplications, useUpdateApplicationStatus } from "@/lib/api/hooks/useEmployer";
import { Button } from "@/components/ui/Button";

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  viewed: "bg-purple-100 text-purple-700",
  shortlisted: "bg-green-100 text-green-700",
  interview_scheduled: "bg-orange-100 text-orange-700",
  interviewed: "bg-cyan-100 text-cyan-700",
  offered: "bg-emerald-100 text-emerald-700",
  hired: "bg-green-200 text-green-800",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-grey-100 text-grey-700",
};

const statusOptions = [
  { value: "viewed", label: "Mark as Viewed" },
  { value: "shortlisted", label: "Shortlist" },
  { value: "interview_scheduled", label: "Schedule Interview" },
  { value: "rejected", label: "Reject" },
  { value: "hired", label: "Mark as Hired" },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithApplicant | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  
  const { data: applications = [], isLoading } = useAllApplications(1, 50, activeTab === "all" ? undefined : activeTab);
  const updateApplicationStatusMutation = useUpdateApplicationStatus();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, app: ApplicationWithApplicant) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  const confirmStatusChange = async () => {
    if (!selectedApp || !newStatus) return;
    
    try {
      await updateApplicationStatusMutation.mutateAsync({ 
        applicationId: selectedApp._id, 
        status: newStatus, 
        notes 
      });
      setStatusDialogOpen(false);
      setNotes("");
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getExperienceText = (app: ApplicationWithApplicant) => {
    const exp = app.applicant?.profile?.totalExperience;
    if (!exp) return "Fresher";
    return `${exp.years}y ${exp.months}m`;
  };

  return (
    <Container maxWidth="lg" className="py-10">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Box>
          <Typography variant="h4" className="font-semibold text-grey-900 dark:text-white">
            Applications
          </Typography>
          <Typography className="text-grey-500">
            Review and manage candidate applications
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper className="mb-6 rounded-xl overflow-x-auto">
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          className="border-b border-grey-200 dark:border-grey-700"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="all" />
          <Tab label="New" value="applied" />
          <Tab label="Shortlisted" value="shortlisted" />
          <Tab label="Interview" value="interview_scheduled" />
          <Tab label="Hired" value="hired" />
          <Tab label="Rejected" value="rejected" />
        </Tabs>
      </Paper>

      {/* Applications List */}
      {isLoading ? (
        <Box className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Box>
      ) : applications.length === 0 ? (
        <Paper className="p-12 rounded-2xl text-center">
          <Work className="text-grey-300 text-6xl mb-4" />
          <Typography variant="h6" className="text-grey-900 dark:text-white mb-2">
            No applications found
          </Typography>
          <Typography className="text-grey-500">
            {activeTab === "all"
              ? "You haven't received any applications yet."
              : `No ${activeTab.replace("_", " ")} applications.`}
          </Typography>
        </Paper>
      ) : (
        <Box className="space-y-4">
          {applications.map((app) => (
            <Paper
              key={app._id}
              className="p-5 rounded-2xl hover:shadow-md transition-shadow"
            >
              <Box className="flex items-start gap-4">
                <Avatar
                  src={app.applicant?.avatar}
                  className="w-14 h-14 bg-primary-100 text-primary-600"
                >
                  {app.applicant?.name?.charAt(0)}
                </Avatar>

                <Box className="flex-1 min-w-0">
                  <Box className="flex items-start justify-between mb-2">
                    <Box>
                      <Typography
                        variant="h6"
                        className="font-semibold text-grey-900 dark:text-white cursor-pointer hover:text-primary-600"
                        onClick={() => router.push(`/employer/applications/${app._id}`)}
                      >
                        {app.applicant?.name}
                      </Typography>
                      <Typography className="text-sm text-grey-500">
                        {app.applicant?.profile?.headline || app.applicant?.email}
                      </Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                      <Chip
                        label={app.status?.replace("_", " ")}
                        size="small"
                        className={`capitalize ${statusColors[app.status] || "bg-grey-100"}`}
                      />
                      <IconButton onClick={(e) => handleMenuOpen(e, app)}>
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box className="flex flex-wrap items-center gap-4 text-sm text-grey-500 mb-3">
                    <Box className="flex items-center gap-1">
                      <Work fontSize="small" />
                      Applied for: {(app as any).job?.title || "Unknown Job"}
                    </Box>
                    <Box className="flex items-center gap-1">
                      <AccessTime fontSize="small" />
                      {getExperienceText(app)} experience
                    </Box>
                    <Box className="flex items-center gap-1">
                      <Schedule fontSize="small" />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </Box>
                  </Box>

                  {/* Skills */}
                  {app.applicant?.profile?.skills && app.applicant.profile.skills.length > 0 && (
                    <Box className="flex flex-wrap gap-2 mb-3">
                      {app.applicant.profile.skills.slice(0, 5).map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {app.applicant.profile.skills.length > 5 && (
                        <Chip
                          label={`+${app.applicant.profile.skills.length - 5}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  )}

                  {/* Match Score */}
                  {app.matchScore?.overall && (
                    <Box className="flex items-center gap-2">
                      <Typography className="text-sm text-grey-500">Match Score:</Typography>
                      <Box
                        className={`px-2 py-0.5 rounded text-sm font-medium ${
                          app.matchScore.overall >= 80
                            ? "bg-green-100 text-green-700"
                            : app.matchScore.overall >= 60
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-grey-100 text-grey-700"
                        }`}
                      >
                        {app.matchScore.overall}%
                      </Box>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box className="flex items-center gap-3 mt-4 pt-4 border-t border-grey-100 dark:border-grey-800">
                    {app.applicant?.email && (
                      <Button
                        variant="outline"
                        size="small"
                        leftIcon={<Email fontSize="small" />}
                        onClick={() => window.open(`mailto:${app.applicant?.email}`)}
                      >
                        Email
                      </Button>
                    )}
                    {app.applicant?.phone && (
                      <Button
                        variant="outline"
                        size="small"
                        leftIcon={<Phone fontSize="small" />}
                        onClick={() => window.open(`tel:${app.applicant?.phone}`)}
                      >
                        Call
                      </Button>
                    )}
                    {app.applicant?.resume?.url && (
                      <Button
                        variant="outline"
                        size="small"
                        leftIcon={<Download fontSize="small" />}
                        onClick={() => window.open(app.applicant?.resume?.url, "_blank")}
                      >
                        Resume
                      </Button>
                    )}
                    <Button
                      variant="text"
                      size="small"
                      leftIcon={<Visibility fontSize="small" />}
                      onClick={() => router.push(`/employer/applications/${app._id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {statusOptions
          .filter((opt) => opt.value !== selectedApp?.status)
          .map((option) => (
            <MenuItem key={option.value} onClick={() => handleStatusChange(option.value)}>
              {option.value === "shortlisted" && <CheckCircle fontSize="small" className="mr-2 text-green-600" />}
              {option.value === "rejected" && <Cancel fontSize="small" className="mr-2 text-red-600" />}
              {option.value === "interview_scheduled" && <Schedule fontSize="small" className="mr-2 text-orange-600" />}
              {option.label}
            </MenuItem>
          ))}
      </Menu>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Application Status
        </DialogTitle>
        <DialogContent>
          <Typography className="mb-4">
            Change status of {selectedApp?.applicant?.name}&apos;s application to{" "}
            <strong className="capitalize">{newStatus.replace("_", " ")}</strong>?
          </Typography>
          <MUITextField
            label="Add a note (optional)"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmStatusChange} isLoading={updateApplicationStatusMutation.isPending}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
