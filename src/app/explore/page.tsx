"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import {
  Container,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import {
  Business,
  AttachMoney,
  QuestionAnswer,
  ArrowForward,
} from "@mui/icons-material";

const exploreOptions = [
  {
    title: "Companies",
    description: "Discover top companies, read reviews, and find your ideal workplace",
    icon: <Business className="text-primary-600 text-4xl" />,
    href: "/explore/companies",
    color: "bg-primary-50 dark:bg-primary-900/20",
  },
  {
    title: "Salaries",
    description: "Explore salary insights and compare compensation across roles and companies",
    icon: <AttachMoney className="text-success-600 text-4xl" />,
    href: "/explore/salaries",
    color: "bg-success-50 dark:bg-success-900/20",
  },
  {
    title: "Interviews",
    description: "Practice with AI mock interviews and prepare for your dream job",
    icon: <QuestionAnswer className="text-accent-600 text-4xl" />,
    href: "/explore/interviews",
    color: "bg-accent-50 dark:bg-accent-900/20",
  },
];

export default function ExplorePage() {
  const router = useRouter();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        <Container maxWidth="lg" className="py-10">
          <Typography
            variant="h4"
            className="font-semibold mb-2 text-grey-900 dark:text-white"
          >
            Explore
          </Typography>
          <Typography className="text-grey-600 dark:text-grey-400 mb-8">
            Discover companies, salaries, and prepare for interviews
          </Typography>

          <Grid container spacing={4}>
            {exploreOptions.map((option) => (
              <Grid item xs={12} md={4} key={option.title}>
                <Card
                  className="p-6 h-full cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => router.push(option.href)}
                >
                  <Box className={`w-16 h-16 rounded-2xl ${option.color} flex items-center justify-center mb-4`}>
                    {option.icon}
                  </Box>
                  <Typography variant="h5" className="font-semibold text-grey-900 dark:text-white mb-2">
                    {option.title}
                  </Typography>
                  <Typography className="text-grey-600 dark:text-grey-400 mb-4">
                    {option.description}
                  </Typography>
                  <Box className="flex items-center text-primary-600 font-medium group-hover:gap-2 transition-all">
                    Explore {option.title}
                    <ArrowForward className="ml-1" fontSize="small" />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>

      <Footer />
    </>
  );
}
