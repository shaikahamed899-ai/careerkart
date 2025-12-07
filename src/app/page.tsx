"use client";

import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { SignUpModal } from "@/components/features/SignUpModal";
import { LoginModal } from "@/components/features/LoginModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUIStore } from "@/store/uiStore";
import { PlayArrow, AutoAwesome } from "@mui/icons-material";
import { Box, Container, Typography, Grid, Avatar } from "@mui/material";

const trustedCompanies = [
  { name: "Capgemini", logo: "/logos/capgemini.png" },
  { name: "Accenture", logo: "/logos/accenture.png" },
  { name: "Deloitte", logo: "/logos/deloitte.png" },
  { name: "Infosys", logo: "/logos/infosys.png" },
  { name: "TCS", logo: "/logos/tcs.png" },
  { name: "Wipro", logo: "/logos/wipro.png" },
];

const features = [
  {
    title: "Smart Job Matching",
    description:
      "Our AI analyzes your skills and preferences to find the perfect job matches.",
    icon: "🎯",
  },
  {
    title: "Resume Analysis",
    description:
      "Get detailed feedback on your resume with actionable improvement suggestions.",
    icon: "📄",
  },
  {
    title: "Interview Prep",
    description:
      "Practice with AI-powered mock interviews tailored to your target roles.",
    icon: "🎤",
  },
  {
    title: "Career Guidance",
    description:
      "Receive personalized career advice from our AI recruiters Donna & Harvey.",
    icon: "💡",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Designer",
    company: "Google",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    quote:
      "CareerKart helped me land my dream job! The AI matching was incredibly accurate.",
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    company: "Microsoft",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    quote:
      "The resume feedback was game-changing. I got 3x more interview calls after using it.",
  },
];

export default function HomePage() {
  const { openSignUp } = useUIStore();

  return (
    <>
      <Header />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 to-white dark:from-primary-950/20 dark:to-grey-950 py-16 md:py-24">
          {/* Background decorative elements */}
          <div className="absolute top-20 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100 dark:bg-accent-900/20 rounded-full blur-3xl opacity-30" />

          <Container maxWidth="lg" className="relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Play button */}
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-grey-800 shadow-card mb-8 hover:shadow-dropdown transition-shadow">
                <PlayArrow className="text-primary-600" fontSize="small" />
                <span className="text-sm font-medium text-grey-700 dark:text-grey-300">
                  Hit Play to know how we work
                </span>
              </button>

              {/* Main heading */}
              <Typography
                variant="h1"
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-grey-900 dark:text-white mb-6"
              >
                Your AI Recruiters Are Ready To Help You Land The Right Job
              </Typography>

              {/* Subheading */}
              <Typography
                variant="body1"
                className="text-lg text-grey-600 dark:text-grey-400 mb-8 max-w-2xl mx-auto"
              >
                Chat with Donna and Harvey to discover smart job matches, get
                interview-ready, practice questions, improve your resume, or ask
                for career advice. everything you need to move forward, all in
                one place.
              </Typography>

              {/* CTA Button */}
              <Button
                variant="primary"
                size="large"
                onClick={openSignUp}
                leftIcon={<AutoAwesome />}
                className="px-8 py-3 text-lg"
              >
                Talk To Donna
              </Button>
            </div>

            {/* AI Recruiters Avatars */}
            <div className="flex justify-center items-center gap-8 mt-12">
              {/* Donna */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary-200" />
                  <div className="w-3 h-3 rounded-full bg-primary-300" />
                  <div className="w-3 h-3 rounded-full bg-primary-400" />
                </div>
                <Avatar
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200"
                  alt="Donna"
                  className="w-20 h-20 border-4 border-primary-500"
                />
                <div className="flex -space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary-400" />
                  <div className="w-3 h-3 rounded-full bg-primary-300" />
                  <div className="w-3 h-3 rounded-full bg-primary-200" />
                </div>
              </div>

              {/* Harvey */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-3 h-3 rounded-full bg-accent-200" />
                  <div className="w-3 h-3 rounded-full bg-accent-300" />
                  <div className="w-3 h-3 rounded-full bg-accent-400" />
                </div>
                <Avatar
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200"
                  alt="Harvey"
                  className="w-20 h-20 border-4 border-accent-500"
                />
                <div className="flex -space-x-2">
                  <div className="w-3 h-3 rounded-full bg-accent-400" />
                  <div className="w-3 h-3 rounded-full bg-accent-300" />
                  <div className="w-3 h-3 rounded-full bg-accent-200" />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Meet AI Recruiters Section */}
        <section className="py-16 bg-white dark:bg-grey-950">
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              className="text-3xl md:text-4xl font-bold text-grey-900 dark:text-white mb-4"
            >
              Meet Our Smartest AI Recruiters
            </Typography>
            <Typography
              variant="body1"
              className="text-grey-600 dark:text-grey-400 mb-12 max-w-2xl"
            >
              Donna for Smart Resume Feedback and Harvey for Interview Prep, a
              Powerful Duo to Supercharge Your Job Search
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card className="p-6 h-full bg-primary-50 dark:bg-primary-950/30 border-none">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200"
                      alt="Donna"
                      className="w-16 h-16"
                    />
                    <div>
                      <Typography variant="h5" className="font-semibold mb-2">
                        Donna - Resume Expert
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-grey-600 dark:text-grey-400"
                      >
                        Get detailed resume analysis, ATS optimization tips, and
                        personalized improvement suggestions to make your resume
                        stand out.
                      </Typography>
                    </div>
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className="p-6 h-full bg-accent-50 dark:bg-accent-950/30 border-none">
                  <div className="flex items-start gap-4">
                    <Avatar
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200"
                      alt="Harvey"
                      className="w-16 h-16"
                    />
                    <div>
                      <Typography variant="h5" className="font-semibold mb-2">
                        Harvey - Interview Coach
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-grey-600 dark:text-grey-400"
                      >
                        Practice mock interviews, get real-time feedback, and
                        prepare for tough questions with our AI interview coach.
                      </Typography>
                    </div>
                  </div>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </section>

        {/* Trusted By Section */}
        <section className="py-12 bg-grey-50 dark:bg-grey-900">
          <Container maxWidth="lg">
            <Typography
              variant="body2"
              className="text-center text-grey-500 mb-8"
            >
              Trusted by Top Employers & Backed by Believers
            </Typography>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {trustedCompanies.map((company) => (
                <div
                  key={company.name}
                  className="text-grey-400 dark:text-grey-600 font-semibold text-lg"
                >
                  {company.name}
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* How We Work Section */}
        <section className="py-16 bg-primary-600">
          <Container maxWidth="lg">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-white">
                <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
                  How We Work:
                </Typography>
                <Typography variant="h3" className="text-2xl md:text-3xl font-semibold mb-6">
                  Simple. Smart. Seamless.
                </Typography>

                <div className="space-y-4">
                  {[
                    "Upload your resume or create one with AI assistance",
                    "Get matched with jobs that fit your skills and goals",
                    "Apply with one click using SmartApply",
                    "Track applications and get interview prep support",
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <Typography variant="body1">{step}</Typography>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600"
                  alt="How we work"
                  className="rounded-2xl shadow-modal"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-grey-950">
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              className="text-3xl md:text-4xl font-bold text-center text-grey-900 dark:text-white mb-4"
            >
              Why choose CareerKart over Recruiters or Job Portals?
            </Typography>
            <Typography
              variant="body1"
              className="text-center text-grey-600 dark:text-grey-400 mb-12 max-w-2xl mx-auto"
            >
              We combine the best of AI technology with human-like guidance to
              give you an unmatched job search experience.
            </Typography>

            <Grid container spacing={4}>
              {features.map((feature) => (
                <Grid item xs={12} sm={6} md={3} key={feature.title}>
                  <Card className="p-6 h-full text-center hover:shadow-dropdown transition-shadow">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <Typography variant="h6" className="font-semibold mb-2">
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-grey-600 dark:text-grey-400"
                    >
                      {feature.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600">
          <Container maxWidth="lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-white max-w-xl">
                <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
                  Enough Talks, Let&apos;s Make Your Job Glow-Up 🚀 With Smart AI
                  Recruiters
                </Typography>
                <Button
                  variant="secondary"
                  size="large"
                  onClick={openSignUp}
                  className="bg-white text-primary-600 hover:bg-grey-100 mt-4"
                >
                  Get Started
                </Button>
              </div>
              <div className="flex -space-x-4">
                <Avatar
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200"
                  alt="Donna"
                  className="w-24 h-24 border-4 border-white"
                />
                <Avatar
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200"
                  alt="Harvey"
                  className="w-24 h-24 border-4 border-white"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white dark:bg-grey-950">
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              className="text-3xl md:text-4xl font-bold text-grey-900 dark:text-white mb-12"
            >
              What Our Members have to say about Us
            </Typography>

            <Grid container spacing={4}>
              {testimonials.map((testimonial) => (
                <Grid item xs={12} md={6} key={testimonial.name}>
                  <Card className="p-6 h-full">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12"
                      />
                      <div>
                        <Typography variant="h6" className="font-semibold">
                          {testimonial.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          className="text-grey-500 mb-3"
                        >
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                        <Typography
                          variant="body1"
                          className="text-grey-700 dark:text-grey-300 italic"
                        >
                          &quot;{testimonial.quote}&quot;
                        </Typography>
                      </div>
                    </div>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-grey-50 dark:bg-grey-900">
          <Container maxWidth="lg">
            <div className="text-center max-w-2xl mx-auto">
              <Typography
                variant="h2"
                className="text-3xl md:text-4xl font-bold text-grey-900 dark:text-white mb-4"
              >
                Put An End To Irrelevant And Endless Job Applications
              </Typography>
              <Typography
                variant="body1"
                className="text-grey-600 dark:text-grey-400 mb-8"
              >
                Join thousands of job seekers who have found their dream jobs
                with CareerKart.
              </Typography>
              <Button
                variant="primary"
                size="large"
                onClick={openSignUp}
                className="px-8"
              >
                Start Your Journey
              </Button>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
      <LoginModal />
      <SignUpModal />
    </>
  );
}
