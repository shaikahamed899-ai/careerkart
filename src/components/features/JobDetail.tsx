"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Job as ApiJob } from "@/lib/api/jobs";
import { Typography, Chip, Divider } from "@mui/material";
import { Business, LocationOn, AccessTime, Work, School, AttachMoney } from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

interface JobDetailProps {
  job: ApiJob | any | null;
  onApply?: (jobId: string) => void;
}

// Helper functions
const getCompanyName = (job: any) => {
  if (typeof job.company === 'string') return job.company;
  return job.company?.name || 'Company';
};

const getLocationString = (job: any) => {
  if (typeof job.location === 'string') return job.location;
  if (job.location?.isRemote) return 'Remote';
  if (job.location?.city) {
    return job.location.state 
      ? `${job.location.city}, ${job.location.state}`
      : job.location.city;
  }
  return job.workMode === 'remote' ? 'Remote' : 'Location not specified';
};

const formatSalary = (salary?: any) => {
  if (!salary || (!salary.min && !salary.max)) return null;
  const min = salary.min ? Math.round(salary.min / 100000) : 0;
  const max = salary.max ? Math.round(salary.max / 100000) : 0;
  if (min && max) return `₹${min}L - ₹${max}L per year`;
  if (min) return `₹${min}L+ per year`;
  if (max) return `Up to ₹${max}L per year`;
  return null;
};

export function JobDetail({ job, onApply }: JobDetailProps) {
  if (!job) {
    return (
      <Card className="h-full flex items-center justify-center text-grey-500 text-sm p-8 bg-white dark:bg-grey-950">
        <div className="text-center">
          <Work className="text-6xl text-grey-300 mb-4" />
          <Typography variant="h6" className="text-grey-500 mb-2">
            Select a job to view details
          </Typography>
          <Typography variant="body2" className="text-grey-400">
            Click on any job from the list to see full details
          </Typography>
        </div>
      </Card>
    );
  }

  const jobId = job._id || job.id;
  const companyName = getCompanyName(job);
  const locationStr = getLocationString(job);
  const salaryStr = formatSalary(job.salary);
  const postedAt = job.postedAt || job.createdAt;
  const timeAgo = postedAt 
    ? formatDistanceToNow(new Date(postedAt), { addSuffix: true })
    : '';
  const companyLogo = job.company?.logo?.url || job.companyLogo;

  return (
    <div className="space-y-4 sticky top-24">
      {/* Top card with organisation, title and Apply */}
      <Card className="p-6 bg-white dark:bg-grey-950">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Business className="text-primary-600 dark:text-primary-400 text-3xl" />
              )}
            </div>
            <div>
              <Typography
                variant="body2"
                className="text-grey-600 dark:text-grey-400 font-medium mb-1"
              >
                {companyName}
                {job.company?.ratings?.overall && (
                  <span className="ml-2">⭐ {job.company.ratings.overall.toFixed(1)}</span>
                )}
              </Typography>
              <Typography variant="h5" className="font-semibold mb-2 text-grey-900 dark:text-white">
                {job.title}
              </Typography>
              <div className="flex flex-wrap items-center gap-3 text-sm text-grey-600 dark:text-grey-400">
                <div className="flex items-center gap-1">
                  <LocationOn fontSize="small" />
                  <span>{locationStr}</span>
                </div>
                {timeAgo && (
                  <div className="flex items-center gap-1">
                    <AccessTime fontSize="small" />
                    <span>Posted {timeAgo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.employmentType && (
            <Chip
              label={job.employmentType.replace('_', ' ')}
              size="small"
              className="capitalize bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
            />
          )}
          {job.workMode && (
            <Chip
              label={job.workMode}
              size="small"
              className="capitalize"
              color={job.workMode === 'remote' ? 'success' : 'default'}
            />
          )}
          {job.experience?.min !== undefined && (
            <Chip
              icon={<Work fontSize="small" />}
              label={`${job.experience.min}${job.experience.max ? `-${job.experience.max}` : '+'} years exp`}
              size="small"
            />
          )}
          {job.openings && job.openings > 1 && (
            <Chip
              label={`${job.openings} openings`}
              size="small"
              color="info"
            />
          )}
        </div>

        {/* Salary & Apply */}
        <div className="flex items-center justify-between pt-4 border-t border-grey-200 dark:border-grey-700">
          <div>
            {salaryStr && (
              <div className="flex items-center gap-2">
                <AttachMoney className="text-success-600" />
                <Typography variant="h6" className="font-semibold text-success-600">
                  {salaryStr}
                </Typography>
              </div>
            )}
            {!salaryStr && (
              <Typography variant="body2" className="text-grey-500">
                Salary not disclosed
              </Typography>
            )}
          </div>
          <Button 
            variant={job.hasApplied ? "outline" : "primary"} 
            size="medium" 
            className="rounded-full px-6"
            onClick={() => onApply?.(jobId)}
            disabled={job.hasApplied}
          >
            {job.hasApplied ? "Already Applied" : "Apply Now"}
          </Button>
        </div>

        {/* Match Score */}
        {job.matchScore !== undefined && job.matchScore > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-grey-50 dark:bg-grey-800 rounded-2xl p-4">
            <div className="rounded-xl bg-white dark:bg-grey-900 border border-grey-100 dark:border-grey-700 p-3">
              <p className="text-xs text-grey-500 mb-1">Profile Match</p>
              <p className="text-2xl font-semibold text-success-600">
                {job.matchScore}%
              </p>
            </div>
            <div className="rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 p-3">
              <p className="text-xs text-grey-500 mb-1">Applications</p>
              <p className="text-2xl font-semibold text-primary-700 dark:text-primary-300">
                {job.stats?.applications || 0}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Description sections */}
      <Card className="p-6 bg-white dark:bg-grey-950">
        <section className="space-y-6 text-sm leading-relaxed text-grey-800 dark:text-grey-200">
          {job.description && (
            <div>
              <h3 className="font-semibold mb-2 text-grey-900 dark:text-white text-base">About the Role</h3>
              <p className="whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-grey-900 dark:text-white text-base">Key Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.responsibilities.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-grey-900 dark:text-white text-base">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.requirements.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {job.niceToHave && job.niceToHave.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-grey-900 dark:text-white text-base">Nice to Have</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.niceToHave.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-grey-900 dark:text-white text-base">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: any, idx: number) => (
                  <Chip
                    key={idx}
                    label={typeof skill === 'string' ? skill : skill.name}
                    size="small"
                    color={skill.isRequired ? 'primary' : 'default'}
                    variant={skill.isRequired ? 'filled' : 'outlined'}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </Card>

      {/* Company Info Card */}
      {job.company && typeof job.company === 'object' && (
        <Card className="p-4 bg-grey-50 dark:bg-grey-900">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="subtitle2" className="font-semibold text-grey-900 dark:text-white">
                About {companyName}
              </Typography>
              {job.company.industry && (
                <Typography variant="body2" className="text-grey-600 dark:text-grey-400">
                  {job.company.industry}
                </Typography>
              )}
            </div>
            <Button variant="outline" size="small" className="rounded-full">
              View Company
            </Button>
          </div>
        </Card>
      )}

      {/* AI Assistant tip */}
      <Card className="p-4 bg-primary-50 dark:bg-primary-900/30 flex items-center justify-between">
        <div>
          <p className="font-semibold mb-1 text-grey-900 dark:text-white">
            Need help preparing for this role?
          </p>
          <div className="flex flex-wrap gap-2 text-xs mt-1">
            <Chip label="Interview Tips" size="small" />
            <Chip label="Salary Insights" size="small" />
            <Chip label="Company Reviews" size="small" />
          </div>
        </div>
        <Button variant="primary" size="small" className="rounded-full px-4">
          Get Help
        </Button>
      </Card>
    </div>
  );
}
