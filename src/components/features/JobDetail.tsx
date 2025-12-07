"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Job } from "@/types";
import { Typography, Chip } from "@mui/material";
import { Business, LocationOn } from "@mui/icons-material";

interface JobDetailProps {
  job: Job | null;
}

export function JobDetail({ job }: JobDetailProps) {
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center text-grey-500 text-sm">
        Select a job from the list to view details.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top card with organisation, title and SmartApply */}
      <Card className="p-6 bg-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <Typography
              variant="body2"
              className="text-grey-600 font-medium mb-1"
            >
              {job.company}
            </Typography>
            <Typography variant="h6" className="font-semibold mb-1">
              {job.title}
            </Typography>
            <div className="flex items-center gap-2 text-sm text-grey-600">
              <LocationOn fontSize="small" />
              <span>{job.location}</span>
              {job.salary && (
                <>
                  <span className="mx-1">•</span>
                  <span>
                    ₹{job.salary.min}L - ₹{job.salary.max}L
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {job.isSmartApply && (
              <Button variant="primary" size="small" className="rounded-full px-4">
                SmartApply
              </Button>
            )}
            <Chip
              label={job.type || "Remote"}
              size="small"
              className="bg-primary-50 text-primary-700 font-medium"
            />
          </div>
        </div>

        {/* Match cards */}
        {job.matchScore !== undefined && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-grey-50 rounded-2xl p-4">
            <div className="rounded-xl bg-white border border-grey-100 p-3">
              <p className="text-xs text-grey-500 mb-1">Required Score for this Job</p>
              <p className="text-2xl font-semibold text-grey-900">
                {job.requiredScore ?? 68}
              </p>
            </div>
            <div className="rounded-xl bg-accent-50 border border-accent-100 p-3">
              <p className="text-xs text-grey-500 mb-1">Your Score</p>
              <p className="text-2xl font-semibold text-accent-700">
                {job.yourScore ?? 75}
              </p>
            </div>
            <div className="rounded-xl bg-success-50 border border-success-100 p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-grey-500 mb-1">Your Profile Match</p>
                <p className="text-2xl font-semibold text-success-700">
                  {job.matchScore}%
                </p>
              </div>
              <Button variant="primary" size="small" className="rounded-full px-4">
                Retry Interview
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Description sections */}
      <Card className="p-6 bg-white">
        <section className="space-y-4 text-sm leading-relaxed text-grey-800">
          {job.description && (
            <div>
              <h3 className="font-semibold mb-1">About Measured</h3>
              <p>{job.description}</p>
            </div>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Key Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Ideal Experience</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.requirements.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Benefits</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.benefits.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </Card>

      {/* Donna tips strip placeholder */}
      <Card className="p-4 bg-primary-50 flex items-center justify-between">
        <div>
          <p className="font-semibold mb-1">
            Let&apos;s Level up more , Donna has quick tips to boost your chances
          </p>
          <div className="flex flex-wrap gap-2 text-xs mt-1">
            <Chip label="Interview Tips" size="small" />
            <Chip label="Salary Negotiation" size="small" />
            <Chip label="How to smartly Track job application" size="small" />
          </div>
        </div>
        <Button variant="primary" size="small" className="rounded-full px-4">
          Talk To Donna
        </Button>
      </Card>
    </div>
  );
}
