"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { JobCard } from "@/components/features/JobCard";
import { JobDetail } from "@/components/features/JobDetail";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useJobs, useJobFilters, useSaveJob, useApplyJob } from "@/lib/api/hooks/useJobs";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useRoleBasedRedirect } from "@/hooks/useRoleBasedRedirect";
import {
  Container,
  Grid,
  Typography,
  Skeleton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Drawer,
  IconButton,
  Slider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search,
  LocationOn,
  FilterList,
  Close as CloseIcon,
} from "@mui/icons-material";

const employmentTypes = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

const workModes = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export default function JobsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { showSnackbar, openSignIn } = useUIStore();
  const { isLoading: authLoading } = useRoleBasedRedirect();
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<number[]>([0, 100]);
  const [experienceRange, setExperienceRange] = useState<number[]>([0, 15]);
  const [sortBy, setSortBy] = useState<'newest' | 'relevance' | 'salary_high'>('newest');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  // Build filters object
  const filters = useMemo(() => ({
    page,
    limit: 10,
    search: searchQuery || undefined,
    location: locationQuery || undefined,
    employmentType: selectedTypes.length > 0 ? selectedTypes : undefined,
    workMode: selectedWorkModes.length > 0 ? selectedWorkModes : undefined,
    salaryMin: salaryRange[0] * 100000 || undefined,
    salaryMax: salaryRange[1] * 100000 || undefined,
    experienceMin: experienceRange[0] || undefined,
    experienceMax: experienceRange[1] || undefined,
    sortBy,
  }), [page, searchQuery, locationQuery, selectedTypes, selectedWorkModes, salaryRange, experienceRange, sortBy]);

  const { data, isLoading, error, refetch } = useJobs(filters);
  const { data: filterOptions } = useJobFilters();
  const saveJobMutation = useSaveJob();
  const applyJobMutation = useApplyJob();

  const jobs = data?.data ?? [];
  const selectedJob = jobs.find((job) => job._id === selectedJobId) || (jobs.length > 0 ? jobs[0] : null);

  // Set first job as selected when jobs load
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  const handleWorkModeToggle = (mode: string) => {
    setSelectedWorkModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleSaveJob = async (jobId: string) => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    try {
      await saveJobMutation.mutateAsync(jobId);
      showSnackbar("Job saved successfully!", "success");
    } catch (error) {
      showSnackbar("Failed to save job", "error");
    }
  };

  const handleApplyClick = (jobId: string) => {
    if (!isAuthenticated) {
      openSignIn();
      return;
    }
    setSelectedJobId(jobId);
    setApplyDialogOpen(true);
  };

  const handleApplySubmit = async () => {
    if (!selectedJobId) return;
    try {
      await applyJobMutation.mutateAsync({ jobId: selectedJobId, coverLetter });
      showSnackbar("Application submitted successfully!", "success");
      setApplyDialogOpen(false);
      setCoverLetter("");
    } catch (error: any) {
      showSnackbar(error.message || "Failed to apply", "error");
    }
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedWorkModes([]);
    setSalaryRange([0, 100]);
    setExperienceRange([0, 15]);
    setSearchQuery("");
    setLocationQuery("");
    setPage(1);
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-900">
        {/* Search Header */}
        <section className="bg-white dark:bg-grey-950 border-b border-grey-200 dark:border-grey-800 py-6">
          <Container maxWidth="lg">
            <div className="flex flex-col md:flex-row gap-4">
              <TextField
                placeholder="Search jobs, skills, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="text-grey-400" />}
                className="flex-1"
              />
              <TextField
                placeholder="Location"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                leftIcon={<LocationOn className="text-grey-400" />}
                className="md:w-64"
              />
              <Button variant="primary" className="md:w-32">
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                leftIcon={<FilterList />}
                className="md:hidden"
              >
                Filters
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {employmentTypes.map((type) => (
                <Chip
                  key={type.value}
                  label={type.label}
                  onClick={() => handleTypeToggle(type.value)}
                  variant={selectedTypes.includes(type.value) ? "filled" : "outlined"}
                  color={selectedTypes.includes(type.value) ? "primary" : "default"}
                  className="cursor-pointer"
                />
              ))}
              {workModes.map((mode) => (
                <Chip
                  key={mode.value}
                  label={mode.label}
                  onClick={() => handleWorkModeToggle(mode.value)}
                  variant={selectedWorkModes.includes(mode.value) ? "filled" : "outlined"}
                  color={selectedWorkModes.includes(mode.value) ? "primary" : "default"}
                  className="cursor-pointer"
                />
              ))}
            </div>
          </Container>
        </section>

        {/* Main Content */}
        <Container maxWidth="lg" className="py-8">
          <Grid container spacing={4}>
            {/* Sidebar Filters - Desktop */}
            <Grid item xs={12} md={3} className="hidden md:block">
              <div className="bg-white dark:bg-grey-950 rounded-lg p-6 shadow-card sticky top-24">
                <Typography variant="h6" className="font-semibold mb-4">
                  Filters
                </Typography>

                {/* Employment Type */}
                <div className="mb-6">
                  <Typography
                    variant="subtitle2"
                    className="font-medium mb-2 text-grey-700 dark:text-grey-300"
                  >
                    Employment Type
                  </Typography>
                  <FormGroup>
                    {employmentTypes.map((type) => (
                      <FormControlLabel
                        key={type.value}
                        control={
                          <Checkbox
                            checked={selectedTypes.includes(type.value)}
                            onChange={() => handleTypeToggle(type.value)}
                            size="small"
                          />
                        }
                        label={type.label}
                        className="text-sm"
                      />
                    ))}
                  </FormGroup>
                </div>

                {/* Work Mode */}
                <div className="mb-6">
                  <Typography
                    variant="subtitle2"
                    className="font-medium mb-2 text-grey-700 dark:text-grey-300"
                  >
                    Work Mode
                  </Typography>
                  <FormGroup>
                    {workModes.map((mode) => (
                      <FormControlLabel
                        key={mode.value}
                        control={
                          <Checkbox
                            checked={selectedWorkModes.includes(mode.value)}
                            onChange={() => handleWorkModeToggle(mode.value)}
                            size="small"
                          />
                        }
                        label={mode.label}
                        className="text-sm"
                      />
                    ))}
                  </FormGroup>
                </div>

                {/* Experience Range */}
                <div className="mb-6">
                  <Typography
                    variant="subtitle2"
                    className="font-medium mb-2 text-grey-700 dark:text-grey-300"
                  >
                    Experience (Years)
                  </Typography>
                  <Slider
                    value={experienceRange}
                    onChange={(_, newValue) =>
                      setExperienceRange(newValue as number[])
                    }
                    valueLabelDisplay="auto"
                    min={0}
                    max={15}
                    marks={[
                      { value: 0, label: "0" },
                      { value: 5, label: "5" },
                      { value: 10, label: "10" },
                      { value: 15, label: "15+" },
                    ]}
                  />
                </div>

                {/* Salary Range */}
                <div className="mb-6">
                  <Typography
                    variant="subtitle2"
                    className="font-medium mb-2 text-grey-700 dark:text-grey-300"
                  >
                    Salary Range (LPA)
                  </Typography>
                  <Slider
                    value={salaryRange}
                    onChange={(_, newValue) =>
                      setSalaryRange(newValue as number[])
                    }
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                    marks={[
                      { value: 0, label: "0" },
                      { value: 50, label: "50L" },
                      { value: 100, label: "100L+" },
                    ]}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" fullWidth onClick={clearFilters}>
                    Clear
                  </Button>
                  <Button variant="primary" fullWidth onClick={handleSearch}>
                    Apply
                  </Button>
                </div>
              </div>
            </Grid>

            {/* Job Listings + Detail */}
            <Grid item xs={12} md={9}>
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h5" className="font-semibold">
                  {data?.total || 0} Jobs Found
                </Typography>
                <FormControl size="small" className="w-40">
                  <InputLabel>Sort By</InputLabel>
                  <Select 
                    label="Sort By" 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="salary_high">Highest Salary</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <Grid container spacing={3}>
                {/* Left: job list */}
                <Grid item xs={12} md={5}>
                  {/* Loading State */}
                  {isLoading && (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton
                          key={i}
                          variant="rectangular"
                          height={160}
                          className="rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="text-center py-12">
                      <Typography variant="h6" className="text-error-500 mb-2">
                        Failed to load jobs
                      </Typography>
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Job Cards */}
                  {!isLoading && jobs.length > 0 && (
                    <div className="space-y-3">
                      {jobs.map((job) => (
                        <JobCard
                          key={job._id}
                          job={job}
                          onSave={(id) => handleSaveJob(id)}
                          onApply={(id) => handleApplyClick(id)}
                          isSelected={selectedJob?._id === job._id}
                          onSelect={(id) => setSelectedJobId(id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoading && !error && jobs.length === 0 && (
                    <div className="text-center py-12">
                      <Typography variant="h6" className="text-grey-500 mb-2">
                        No jobs found
                      </Typography>
                      <Typography variant="body2" className="text-grey-400 mb-4">
                        Try adjusting your filters or search query
                      </Typography>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  )}

                  {/* Pagination below list */}
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
                </Grid>

                {/* Right: detail panel */}
                <Grid item xs={12} md={7}>
                  <JobDetail job={selectedJob} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </main>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        PaperProps={{
          className: "rounded-t-2xl max-h-[80vh]",
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h6" className="font-semibold">
              Filters
            </Typography>
            <IconButton onClick={() => setIsFilterOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          {/* Mobile filter content - same as sidebar */}
          <div className="space-y-6">
            <div>
              <Typography variant="subtitle2" className="font-medium mb-2">
                Employment Type
              </Typography>
              <div className="flex flex-wrap gap-2">
                {employmentTypes.map((type) => (
                  <Chip
                    key={type.value}
                    label={type.label}
                    onClick={() => handleTypeToggle(type.value)}
                    variant={selectedTypes.includes(type.value) ? "filled" : "outlined"}
                    color={selectedTypes.includes(type.value) ? "primary" : "default"}
                  />
                ))}
              </div>
            </div>

            <div>
              <Typography variant="subtitle2" className="font-medium mb-2">
                Work Mode
              </Typography>
              <div className="flex flex-wrap gap-2">
                {workModes.map((mode) => (
                  <Chip
                    key={mode.value}
                    label={mode.label}
                    onClick={() => handleWorkModeToggle(mode.value)}
                    variant={selectedWorkModes.includes(mode.value) ? "filled" : "outlined"}
                    color={selectedWorkModes.includes(mode.value) ? "primary" : "default"}
                  />
                ))}
              </div>
            </div>

            <div>
              <Typography variant="subtitle2" className="font-medium mb-2">
                Salary Range (LPA)
              </Typography>
              <Slider
                value={salaryRange}
                onChange={(_, newValue) => setSalaryRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={100}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={clearFilters}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setIsFilterOpen(false);
                  handleSearch();
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Apply Job Dialog */}
      <Dialog
        open={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-semibold">
          Apply for {selectedJob?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-grey-600 mb-4">
            {selectedJob?.company?.name}
          </Typography>
          <TextField
            label="Cover Letter (Optional)"
            placeholder="Tell the employer why you're a great fit for this role..."
            multiline
            rows={6}
            fullWidth
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
          {!user?.resumeUploaded && (
            <Typography variant="caption" className="text-warning-600 mt-2 block">
              ⚠️ You haven't uploaded a resume yet. Consider uploading one in your profile.
            </Typography>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApplySubmit}
            isLoading={applyJobMutation.isPending}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}
