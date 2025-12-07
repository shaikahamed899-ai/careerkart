"use client";

import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { Container, Grid, Typography, Avatar } from "@mui/material";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        <Container maxWidth="lg" className="py-10">
          <Typography
            variant="h4"
            className="font-semibold mb-6 text-grey-900 dark:text-white"
          >
            My Profile
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className="p-6 flex flex-col items-center gap-4">
                <Avatar
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-24 h-24 text-3xl"
                >
                  {user?.name?.charAt(0) ?? "U"}
                </Avatar>
                <div className="text-center">
                  <Typography variant="h6" className="font-semibold">
                    {user?.name ?? "Guest User"}
                  </Typography>
                  <Typography variant="body2" className="text-grey-500">
                    {user?.email ?? "Not signed in"}
                  </Typography>
                </div>
                <Button variant="outline" fullWidth>
                  Upload / Update Resume
                </Button>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card className="p-6 space-y-5">
                <Typography variant="h6" className="font-semibold mb-2">
                  Personal Information
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Full Name"
                    placeholder="Enter your name"
                    defaultValue={user?.name}
                  />
                  <TextField
                    label="Email"
                    placeholder="Enter your email"
                    defaultValue={user?.email}
                  />
                  <TextField label="Phone" placeholder="Enter your phone" />
                  <TextField label="Location" placeholder="City, Country" />
                </div>

                <TextField
                  label="Professional Summary"
                  placeholder="Tell us about your experience, skills and career goals"
                  multiline
                  rows={4}
                  className="mt-4"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="primary">Save Changes</Button>
                </div>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </main>

      <Footer />
    </>
  );
}
