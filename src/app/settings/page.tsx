"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useUpdatePreferences } from "@/lib/api/hooks/useUser";
import { authApi, userApi } from "@/lib/api";
import {
  Container,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  DarkMode,
  Notifications,
  Security,
  Delete,
  Lock,
  Email,
} from "@mui/icons-material";

export default function SettingsPage() {
  const router = useRouter();
  const { mode, toggleTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { showSnackbar } = useUIStore();
  const updatePreferencesMutation = useUpdatePreferences();

  const [preferences, setPreferences] = useState({
    jobAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    profileVisibility: 'public' as 'public' | 'private' | 'recruiters_only',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Initialize preferences from user data
  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        jobAlerts: user.preferences.jobAlerts ?? true,
        emailNotifications: user.preferences.emailNotifications ?? true,
        smsNotifications: user.preferences.smsNotifications ?? false,
        profileVisibility: user.preferences.profileVisibility as any ?? 'public',
      });
    }
  }, [user]);

  const handlePreferenceChange = async (key: string, value: boolean | string) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      await updatePreferencesMutation.mutateAsync(newPreferences);
      showSnackbar("Preferences updated", "success");
    } catch (error) {
      showSnackbar("Failed to update preferences", "error");
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showSnackbar("Passwords don't match", "error");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showSnackbar("Password must be at least 8 characters", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showSnackbar("Password changed successfully", "success");
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showSnackbar(error.message || "Failed to change password", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Call API to deactivate account
      await userApi.deactivateAccount();
      await logout();
      showSnackbar("Account deleted successfully", "success");
      router.push("/");
    } catch (error: any) {
      showSnackbar(error.message || "Failed to delete account", "error");
    }
    setDeleteDialogOpen(false);
  };

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

          <div className="space-y-4 max-w-2xl">
            {/* Appearance */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <DarkMode className="text-primary-600" />
                <Typography variant="h6" className="font-semibold">
                  Appearance
                </Typography>
              </div>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === "dark"}
                      onChange={toggleTheme}
                      color="primary"
                    />
                  }
                  label={
                    <div>
                      <Typography variant="body1">Dark Mode</Typography>
                      <Typography variant="caption" className="text-grey-500">
                        Switch between light and dark theme
                      </Typography>
                    </div>
                  }
                />
              </FormGroup>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Notifications className="text-primary-600" />
                <Typography variant="h6" className="font-semibold">
                  Notifications
                </Typography>
              </div>
              <FormGroup className="space-y-2">
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.jobAlerts}
                      onChange={(e) => handlePreferenceChange('jobAlerts', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <div>
                      <Typography variant="body1">Job Alerts</Typography>
                      <Typography variant="caption" className="text-grey-500">
                        Get notified about new jobs matching your profile
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <div>
                      <Typography variant="body1">Email Notifications</Typography>
                      <Typography variant="caption" className="text-grey-500">
                        Receive updates and alerts via email
                      </Typography>
                    </div>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.smsNotifications}
                      onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <div>
                      <Typography variant="body1">SMS Notifications</Typography>
                      <Typography variant="caption" className="text-grey-500">
                        Receive important alerts via SMS
                      </Typography>
                    </div>
                  }
                />
              </FormGroup>
            </Card>

            {/* Privacy */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Security className="text-primary-600" />
                <Typography variant="h6" className="font-semibold">
                  Privacy
                </Typography>
              </div>
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" className="font-medium mb-2">
                    Profile Visibility
                  </Typography>
                  <div className="space-y-2">
                    {[
                      { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                      { value: 'recruiters_only', label: 'Recruiters Only', desc: 'Only recruiters can view your profile' },
                      { value: 'private', label: 'Private', desc: 'Only you can view your profile' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          preferences.profileVisibility === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-grey-200 dark:border-grey-700 hover:border-grey-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="visibility"
                          value={option.value}
                          checked={preferences.profileVisibility === option.value}
                          onChange={(e) => handlePreferenceChange('profileVisibility', e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <Typography variant="body2" className="font-medium">
                            {option.label}
                          </Typography>
                          <Typography variant="caption" className="text-grey-500">
                            {option.desc}
                          </Typography>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-primary-600" />
                <Typography variant="h6" className="font-semibold">
                  Security
                </Typography>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body1" className="font-medium">
                      Change Password
                    </Typography>
                    <Typography variant="body2" className="text-grey-500">
                      Update your account password
                    </Typography>
                  </div>
                  <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                    Change
                  </Button>
                </div>
                <Divider />
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="body1" className="font-medium">
                      Email
                    </Typography>
                    <Typography variant="body2" className="text-grey-500">
                      {user?.email}
                    </Typography>
                  </div>
                  {user?.isEmailVerified ? (
                    <Typography variant="caption" className="text-success-600 flex items-center gap-1">
                      ✓ Verified
                    </Typography>
                  ) : (
                    <Button variant="outline" size="small">
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-error-200 dark:border-error-800">
              <div className="flex items-center gap-3 mb-4">
                <Delete className="text-error-600" />
                <Typography variant="h6" className="font-semibold text-error-600">
                  Danger Zone
                </Typography>
              </div>
              <Alert severity="warning" className="mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </Alert>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <Typography variant="subtitle1" className="font-medium">
                    Delete Account
                  </Typography>
                  <Typography variant="body2" className="text-grey-600 dark:text-grey-400">
                    Permanently delete your account and all associated data.
                  </Typography>
                </div>
                <Button
                  variant="outline"
                  className="text-error-600 border-error-300 hover:bg-error-50"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          />
        </DialogContent>
        <DialogActions className="p-4">
          <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangePassword} isLoading={isChangingPassword}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle className="text-error-600">Delete Account</DialogTitle>
        <DialogContent>
          <Typography variant="body1" className="mb-4">
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
          <Typography variant="body2" className="text-grey-600">
            All your data including profile, applications, and saved jobs will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions className="p-4">
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-error-600 hover:bg-error-700"
            onClick={handleDeleteAccount}
          >
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}
