"use client";

import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useThemeStore } from "@/store/themeStore";
import {
  Container,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";

export default function SettingsPage() {
  const { mode, toggleTheme } = useThemeStore();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        <Container maxWidth="lg" className="py-10">
          <Typography
            variant="h4"
            className="font-semibold mb-6 text-grey-900 dark:text-white"
          >
            Settings
          </Typography>

          <div className="space-y-4">
            <Card className="p-6">
              <Typography variant="h6" className="font-semibold mb-3">
                Appearance
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === "dark"}
                      onChange={toggleTheme}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
              </FormGroup>
            </Card>

            <Card className="p-6">
              <Typography variant="h6" className="font-semibold mb-3">
                Notifications
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Job match notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Resume score updates"
                />
                <FormControlLabel
                  control={<Switch color="primary" />}
                  label="Product updates & tips"
                />
              </FormGroup>
            </Card>

            <Card className="p-6">
              <Typography variant="h6" className="font-semibold mb-3">
                Account
              </Typography>
              <Typography variant="body2" className="text-grey-600 mb-4">
                Manage your account preferences and security.
              </Typography>
              <Divider className="my-3" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <Typography variant="subtitle1" className="font-medium">
                    Delete Account
                  </Typography>
                  <Typography variant="body2" className="text-grey-600">
                    Permanently delete your account and all associated data.
                  </Typography>
                </div>
                <Button variant="outline" className="text-error-600 border-error-300">
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}
