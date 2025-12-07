import { Notification } from "@/types";

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "general",
    title: "Notification Subject",
    description: "Description text for notification",
    timestamp: "2024-12-07T06:00:00Z",
    read: false,
    actionLabel: "Button",
  },
  {
    id: "2",
    type: "job_match",
    title: "Matching jobs found for you",
    description: "Similar opportunities found for you",
    timestamp: "2024-12-07T06:00:00Z",
    read: false,
    actionUrl: "/jobs",
    actionLabel: "View Jobs",
  },
  {
    id: "3",
    type: "resume_score",
    title: "Detailed Resume Score Generated",
    description: "Talk to donna to make your resume stand out.",
    timestamp: "2024-12-07T06:00:00Z",
    read: false,
    actionUrl: "/profile/resume",
    actionLabel: "View Score",
  },
];

export const getMockNotifications = (): Notification[] => {
  return mockNotifications;
};
