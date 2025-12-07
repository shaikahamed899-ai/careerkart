"use client";

import { useState } from "react";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { JobCard } from "@/components/features/JobCard";
import { JobDetail } from "@/components/features/JobDetail";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useJobs } from "@/lib/api/hooks/useJobs";
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
} from "@mui/material";
import {
  Search,
  LocationOn,
  FilterList,
  Close as CloseIcon,
} from "@mui/icons-material";

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior", "Lead", "Executive"];

export default function JobsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<number[]>([0, 50]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data, isLoading, error } = useJobs(page, 10);

  const jobs = data?.data ?? [];
  const selectedJob =
    jobs.find((job) => job.id === selectedJobId) || (jobs.length > 0 ? jobs[0] : null);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
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
              {jobTypes.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => handleTypeToggle(type)}
                  variant={selectedTypes.includes(type) ? "filled" : "outlined"}
                  color={selectedTypes.includes(type) ? "primary" : "default"}
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

                {/* Job Type */}
                <div className="mb-6">
                  <Typography
                    variant="subtitle2"
                    className="font-medium mb-2 text-grey-700 dark:text-grey-300"
                  >
                    Job Type
                  </Typography>
                  <FormGroup>
                    {jobTypes.map((type) => (
                      <FormControlLabel
                        key={type}
                        control={
                          <Checkbox
                            checked={selectedTypes.includes(type)}
                            onChange={() => handleTypeToggle(type)}
                            size="small"
                          />
                        }
                        label={type}
                        className="text-sm"
                      />
                    ))}
                  </FormGroup>
                </div>

                {/* Experience Level */}
                <div className="mb-6">
                  <Typography
                    variant="subtitle2"
                    className="font-medium mb-2 text-grey-700 dark:text-grey-300"
                  >
                    Experience Level
                  </Typography>
                  <FormGroup>
                    {experienceLevels.map((level) => (
                      <FormControlLabel
                        key={level}
                        control={<Checkbox size="small" />}
                        label={level}
                        className="text-sm"
                      />
                    ))}
                  </FormGroup>
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

                <Button variant="primary" fullWidth>
                  Apply Filters
                </Button>
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
                  <Select label="Sort By" defaultValue="relevance">
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="date">Date Posted</MenuItem>
                    <MenuItem value="salary">Salary</MenuItem>
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
                  {jobs.length > 0 && (
                    <div className="space-y-3">
                      {jobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onSave={(id) => console.log("Save job:", id)}
                          onApply={(id) => console.log("Apply to job:", id)}
                          isSelected={selectedJob?.id === job.id}
                          onSelect={(id) => setSelectedJobId(id)}
                        />
                      ))}
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
                Job Type
              </Typography>
              <div className="flex flex-wrap gap-2">
                {jobTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    onClick={() => handleTypeToggle(type)}
                    variant={selectedTypes.includes(type) ? "filled" : "outlined"}
                    color={selectedTypes.includes(type) ? "primary" : "default"}
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
                onClick={() => {
                  setSelectedTypes([]);
                  setSalaryRange([0, 50]);
                }}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => setIsFilterOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Drawer>

      <Footer />
    </>
  );
}
