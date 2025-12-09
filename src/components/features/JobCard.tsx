"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip, LinearProgress, Box, Typography, IconButton } from "@mui/material";
import { Bookmark, BookmarkBorder, LocationOn, Business, Work } from "@mui/icons-material";
import { Job as ApiJob } from "@/lib/api/jobs";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

// Support both old Job type and new API Job type
interface JobCardProps {
  job: ApiJob | any;
  variant?: "default" | "compact";
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  isSaved?: boolean;
  isSelected?: boolean;
  onSelect?: (jobId: string) => void;
}

// Helper to format salary
const formatSalary = (salary?: ApiJob['salary']) => {
  if (!salary || (!salary.min && !salary.max)) return null;
  const min = salary.min ? Math.round(salary.min / 100000) : 0;
  const max = salary.max ? Math.round(salary.max / 100000) : 0;
  if (min && max) return `₹${min}L - ₹${max}L`;
  if (min) return `₹${min}L+`;
  if (max) return `Up to ₹${max}L`;
  return null;
};

// Helper to get location string
const getLocationString = (job: ApiJob | any) => {
  if (typeof job.location === 'string') return job.location;
  if (job.location?.isRemote) return 'Remote';
  if (job.location?.city) {
    return job.location.state 
      ? `${job.location.city}, ${job.location.state}`
      : job.location.city;
  }
  return job.workMode === 'remote' ? 'Remote' : 'Location not specified';
};

// Helper to get company name
const getCompanyName = (job: ApiJob | any) => {
  if (typeof job.company === 'string') return job.company;
  return job.company?.name || 'Company';
};

// Helper to get company logo
const getCompanyLogo = (job: ApiJob | any) => {
  if (job.companyLogo) return job.companyLogo;
  return job.company?.logo?.url;
};

export function JobCard({
  job,
  variant = "default",
  onSave,
  onApply,
  isSaved = false,
  isSelected = false,
  onSelect,
}: JobCardProps) {
  const jobId = job._id || job.id;
  const postedAt = job.postedAt || job.createdAt;
  const timeAgo = postedAt 
    ? formatDistanceToNow(new Date(postedAt), { addSuffix: false })
    : '';
  const companyName = getCompanyName(job);
  const companyLogo = getCompanyLogo(job);
  const locationStr = getLocationString(job);
  const salaryStr = formatSalary(job.salary);
  const matchScore = job.matchScore;
  const hasApplied = job.hasApplied;
  const isSavedJob = isSaved || job.isSaved;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(jobId);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply?.(jobId);
  };

  return (
    <Card
      variant="outlined"
      hoverable
      className={clsx(
        "p-4 border-l-4 cursor-pointer transition-all",
        job.isFeatured ? "border-l-primary-600" : "border-l-accent-500",
        isSelected && "ring-2 ring-primary-500 bg-primary-50/40 dark:bg-primary-900/20"
      )}
      onClick={() => onSelect?.(jobId)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Company Logo */}
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Business className="text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <div>
            <Typography
              variant="body2"
              className="text-grey-600 dark:text-grey-400 font-medium"
            >
              {companyName}
            </Typography>
            {job.company?.ratings?.overall && (
              <Typography variant="caption" className="text-grey-500">
                ⭐ {job.company.ratings.overall.toFixed(1)}
              </Typography>
            )}
          </div>
        </div>

        {/* Save & Time */}
        <div className="flex items-center gap-2">
          <IconButton
            size="small"
            onClick={handleSaveClick}
            className="text-grey-500 hover:text-primary-600"
          >
            {isSavedJob ? (
              <Bookmark className="text-primary-600" />
            ) : (
              <BookmarkBorder />
            )}
          </IconButton>
          {timeAgo && (
            <Typography variant="caption" className="text-grey-500">
              {timeAgo}
            </Typography>
          )}
        </div>
      </div>

      {/* Job Title */}
      <Typography
        variant="h6"
        className="font-semibold text-grey-900 dark:text-grey-100 mb-2 line-clamp-2"
      >
        {job.title}
      </Typography>

      {/* Location & Salary */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-grey-600 dark:text-grey-400">
        <div className="flex items-center gap-1">
          <LocationOn fontSize="small" />
          <Typography variant="body2">{locationStr}</Typography>
        </div>
        {salaryStr && (
          <>
            <span className="mx-1">•</span>
            <Typography variant="body2" className="text-success-600 font-medium">
              {salaryStr}
            </Typography>
          </>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {job.employmentType && (
          <Chip
            label={job.employmentType.replace('_', ' ')}
            size="small"
            className="text-xs capitalize"
          />
        )}
        {job.workMode && (
          <Chip
            label={job.workMode}
            size="small"
            className="text-xs capitalize"
            color={job.workMode === 'remote' ? 'success' : 'default'}
          />
        )}
        {job.experience?.min !== undefined && (
          <Chip
            label={`${job.experience.min}${job.experience.max ? `-${job.experience.max}` : '+'} yrs`}
            size="small"
            className="text-xs"
          />
        )}
      </div>

      {/* Match Score */}
      {matchScore !== undefined && matchScore > 0 && (
        <Box className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <Typography variant="caption" className="text-grey-600 dark:text-grey-400">
              Match Score
            </Typography>
            <Typography
              variant="caption"
              className={clsx(
                "font-semibold",
                matchScore >= 80
                  ? "text-success-600"
                  : matchScore >= 60
                  ? "text-accent-600"
                  : "text-grey-600"
              )}
            >
              {matchScore}%
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={matchScore}
            className={clsx(
              "h-2 rounded-full",
              matchScore >= 80
                ? "[&_.MuiLinearProgress-bar]:bg-success-500"
                : matchScore >= 60
                ? "[&_.MuiLinearProgress-bar]:bg-accent-500"
                : "[&_.MuiLinearProgress-bar]:bg-grey-400"
            )}
            sx={{
              backgroundColor: "rgba(0,0,0,0.08)",
              "& .MuiLinearProgress-bar": {
                borderRadius: "9999px",
              },
            }}
          />
        </Box>
      )}

      {/* Apply Button */}
      <Button
        variant={hasApplied ? "outline" : "primary"}
        size="small"
        onClick={handleApplyClick}
        disabled={hasApplied}
        className="mt-2 w-full"
        leftIcon={<Work fontSize="small" />}
      >
        {hasApplied ? "Applied" : "Quick Apply"}
      </Button>
    </Card>
  );
}
