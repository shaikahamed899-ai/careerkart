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
  { name: "3one4", logo: "/assets/peakxv.png" },
  { name: "Accel", logo: "/assets/accel.png" },
  { name: "Blume", logo: "/assets/blume.png" },
  { name: "Chirate", logo: "/assets/chirate.png" },
  { name: "Elevation", logo: "/assets/kalaari.png" },
  { name: "Kalaari", logo: "/assets/elevation.png" },
  { name: "Lightbox", logo: "/assets/lightbox.png" },
  { name: "Lightspeed", logo: "/assets/3one4.png" },
  { name: "Matrix", logo: "/assets/lightspeed.png" },
  { name: "PeakXV", logo: "/assets/matrix.png" },
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
        <section className="relative overflow-hidden bg-[#F0F6FF] py-16 md:py-24">
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
        <section className="bg-white py-12 dark:bg-grey-900">
          <div className="max-w-[1300px] mx-auto px-[70px] py-[35px] gap-[80px]" style={{height: '140px'}}>
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="max-w-[494px] gap-4" style={{height: '140px'}}>
                <Typography
                  variant="h3"
                  className="text-grey-900 dark:text-white mb-4"
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontWeight: 500,
                    fontStyle: 'normal',
                    fontSize: '32px',
                    lineHeight: '120%',
                    letterSpacing: '0%'
                  }}
                >
                  Trusted by Top Employers & Backed by Believers
                </Typography>
                <Typography
                  variant="body2"
                  className="text-grey-600 dark:text-grey-400 italic"
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    fontSize: '16px',
                    lineHeight: '150%',
                    letterSpacing: '0%'
                  }}
                >
                  We're powered by 10,000+ top recruiters and hiring legends who are always on the lookout for talent like you.
                </Typography>
              </div>

              {/* Right Section - Logo Grid */}
              <div className="max-w-[726px]" style={{height: '137px'}}>
                <div className="grid grid-rows-2 grid-cols-5 gap-[23px_20px]">
                  {trustedCompanies.map((company) => (
                    <div
                      key={company.name}
                      className="flex items-center justify-center"
                      style={{width: '129.2px', height: '40.32px'}}
                    >
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work Section */}
        <section className="py-16 bg-primary-600">
          <Container maxWidth="lg">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              {/* Left Section - How We Work and Feature Cards */}
              <div className="flex-1">
                <Typography variant="h2" className="text-4xl font-bold mb-2 text-white">
                  How We Work-
                </Typography>
                <Typography variant="h3" className="text-2xl italic font-semibold mb-12 text-white">
                  Simple. Smart. Seamless.
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Feature Card 1 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                      </div>
                      <div>
                        <Typography variant="h6" className="font-bold text-grey-900 mb-2">
                          Upload & Create
                        </Typography>
                        <Typography variant="body2" className="text-grey-600">
                          Upload your existing resume or create a new one with our AI assistance. Get instant feedback and suggestions to make it stand out.
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Feature Card 2 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                      </div>
                      <div>
                        <Typography variant="h6" className="font-bold text-grey-900 mb-2">
                          Smart Matching
                        </Typography>
                        <Typography variant="body2" className="text-grey-600">
                          Our AI analyzes your skills, experience, and preferences to match you with perfect job opportunities from top companies.
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Feature Card 3 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                      </div>
                      <div>
                        <Typography variant="h6" className="font-bold text-grey-900 mb-2">
                          One-Click Apply
                        </Typography>
                        <Typography variant="body2" className="text-grey-600">
                          Apply to multiple jobs with SmartApply technology. Customize your applications automatically and track everything in one place.
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Feature Card 4 */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          4
                        </div>
                      </div>
                      <div>
                        <Typography variant="h6" className="font-bold text-grey-900 mb-2">
                          Interview Prep
                        </Typography>
                        <Typography variant="body2" className="text-grey-600">
                          Practice with AI-powered mock interviews, get real-time feedback, and receive personalized coaching to ace your interviews.
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Video Player */}
              <div className="flex-1">
                <div className="relative rounded-2xl overflow-hidden shadow-modal w-full h-[400px] bg-grey-200">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600"
                    alt="How we work video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-full p-6 cursor-pointer hover:bg-opacity-100 transition-all">
                      <PlayArrow sx={{ fontSize: 48, color: '#1E40AF' }} />
                    </div>
                    <Typography variant="button" className="absolute bottom-8 text-white font-semibold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                      Play Video
                    </Typography>
                  </div>
                </div>
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
