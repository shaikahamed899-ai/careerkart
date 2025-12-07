import { Job, PaginatedResponse } from "@/types";

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Product Designer",
    company: "Organisation name",
    location: "Onsite-Mumbai, India",
    type: "full-time",
    salary: { min: 8, max: 15, currency: "LPA" },
    description:
      "We are looking for a talented Product Designer to join our team...",
    requirements: [
      "3+ years of experience in product design",
      "Proficiency in Figma and design systems",
      "Strong portfolio demonstrating UX/UI skills",
    ],
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
    postedAt: "2024-12-04T10:00:00Z",
    matchScore: 90,
    isSmartApply: true,
  },
  {
    id: "2",
    title: "Senior Frontend Developer",
    company: "Tech Solutions Inc",
    location: "Remote",
    type: "remote",
    salary: { min: 15, max: 25, currency: "LPA" },
    description: "Join our engineering team to build cutting-edge web applications...",
    requirements: [
      "5+ years of experience with React/Next.js",
      "Strong TypeScript skills",
      "Experience with design systems",
    ],
    skills: ["React", "TypeScript", "Next.js", "TailwindCSS"],
    postedAt: "2024-12-03T14:30:00Z",
    matchScore: 85,
    isSmartApply: true,
  },
  {
    id: "3",
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "Bangalore, India",
    type: "full-time",
    salary: { min: 12, max: 20, currency: "LPA" },
    description: "Looking for a data scientist to work on ML models...",
    requirements: [
      "MS/PhD in Computer Science or related field",
      "Experience with Python and ML frameworks",
      "Strong statistical background",
    ],
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    postedAt: "2024-12-02T09:00:00Z",
    matchScore: 75,
    isSmartApply: false,
  },
  {
    id: "4",
    title: "Backend Engineer",
    company: "StartupXYZ",
    location: "Delhi, India",
    type: "full-time",
    salary: { min: 10, max: 18, currency: "LPA" },
    description: "Build scalable backend services for our growing platform...",
    requirements: [
      "4+ years of experience with Node.js or Python",
      "Experience with microservices architecture",
      "Knowledge of AWS/GCP",
    ],
    skills: ["Node.js", "PostgreSQL", "AWS", "Docker"],
    postedAt: "2024-12-01T11:00:00Z",
    matchScore: 80,
    isSmartApply: true,
  },
  {
    id: "5",
    title: "UX Researcher",
    company: "Design Studio",
    location: "Pune, India",
    type: "full-time",
    salary: { min: 6, max: 12, currency: "LPA" },
    description: "Conduct user research to inform product decisions...",
    requirements: [
      "2+ years of UX research experience",
      "Experience with qualitative and quantitative methods",
      "Strong communication skills",
    ],
    skills: ["User Research", "Usability Testing", "Analytics", "Figma"],
    postedAt: "2024-11-30T16:00:00Z",
    matchScore: 70,
    isSmartApply: false,
  },
  {
    id: "6",
    title: "DevOps Engineer",
    company: "Cloud Systems Ltd",
    location: "Hyderabad, India",
    type: "full-time",
    salary: { min: 14, max: 22, currency: "LPA" },
    description: "Manage and optimize our cloud infrastructure...",
    requirements: [
      "5+ years of DevOps experience",
      "Expert in Kubernetes and Docker",
      "Strong scripting skills",
    ],
    skills: ["Kubernetes", "Docker", "Terraform", "CI/CD"],
    postedAt: "2024-11-29T08:00:00Z",
    matchScore: 65,
    isSmartApply: true,
  },
];

export const getMockJobs = (
  page: number = 1,
  pageSize: number = 10
): PaginatedResponse<Job> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedJobs = mockJobs.slice(start, end);

  return {
    data: paginatedJobs,
    total: mockJobs.length,
    page,
    pageSize,
    totalPages: Math.ceil(mockJobs.length / pageSize),
  };
};

export const getMockJobById = (id: string): Job | undefined => {
  return mockJobs.find((job) => job.id === id);
};
