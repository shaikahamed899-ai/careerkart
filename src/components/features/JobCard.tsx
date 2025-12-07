"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip, LinearProgress, Box, Typography, IconButton } from "@mui/material";
import { Bookmark, BookmarkBorder, LocationOn, Business } from "@mui/icons-material";
import { Job } from "@/types";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

interface JobCardProps {
  job: Job;
  variant?: "default" | "compact";
  onSave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  isSaved?: boolean;
  isSelected?: boolean;
  onSelect?: (jobId: string) => void;
}

export function JobCard({
  job,
  variant = "default",
  onSave,
  onApply,
  isSaved = false,
  isSelected = false,
  onSelect,
}: JobCardProps) {
  const timeAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: false });

  return (
    <Card
      variant="outlined"
      hoverable
      className={clsx(
        "p-4 border-l-4 cursor-pointer",
        job.isSmartApply ? "border-l-primary-600" : "border-l-accent-500",
        isSelected && "ring-2 ring-primary-500 bg-primary-50/40"
      )}
      onClick={() => onSelect?.(job.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Company Logo */}
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
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
              {job.company}
            </Typography>
          </div>
        </div>

        {/* Save & Time */}
        <div className="flex items-center gap-2">
          <IconButton
            size="small"
            onClick={() => onSave?.(job.id)}
            className="text-grey-500 hover:text-primary-600"
          >
            {isSaved ? (
              <Bookmark className="text-primary-600" />
            ) : (
              <BookmarkBorder />
            )}
          </IconButton>
          <Typography variant="caption" className="text-grey-500">
            {timeAgo}
          </Typography>
        </div>
      </div>

      {/* Job Title */}
      <Typography
        variant="h6"
        className="font-semibold text-grey-900 dark:text-grey-100 mb-2"
      >
        {job.title}
      </Typography>

      {/* Location & Type */}
      <div className="flex items-center gap-2 mb-3 text-grey-600 dark:text-grey-400">
        <LocationOn fontSize="small" />
        <Typography variant="body2">{job.location}</Typography>
        {job.salary && (
          <>
            <span className="mx-1">•</span>
            <Typography variant="body2">
              ₹{job.salary.min}L - ₹{job.salary.max}L
            </Typography>
          </>
        )}
      </div>

      {/* Match Score */}
      {job.matchScore !== undefined && (
        <Box className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <Typography variant="caption" className="text-grey-600 dark:text-grey-400">
              Match
            </Typography>
            <Typography
              variant="caption"
              className={clsx(
                "font-semibold",
                job.matchScore >= 80
                  ? "text-success-600"
                  : job.matchScore >= 60
                  ? "text-accent-600"
                  : "text-grey-600"
              )}
            >
              {job.matchScore}%
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={job.matchScore}
            className={clsx(
              "h-2 rounded-full",
              job.matchScore >= 80
                ? "[&_.MuiLinearProgress-bar]:bg-success-500"
                : job.matchScore >= 60
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

      {/* Smart Apply Button */}
      {job.isSmartApply && (
        <Button
          variant="primary"
          size="small"
          onClick={() => onApply?.(job.id)}
          className="mt-2"
          leftIcon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          }
        >
          SmartApply
        </Button>
      )}
    </Card>
  );
}
