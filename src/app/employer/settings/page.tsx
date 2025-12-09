"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  Container,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  Notifications,
  Security,
  Visibility,
  VisibilityOff,
  Save,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { authApi, userApi } from "@/lib/api";

export default function EmployerSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: any) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userApi.updateProfile({ name: data.name });
      if (response.success) {
        updateUser({ name: data.name });
        setSuccess("Profile updated successfully");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      setSuccess("Password changed successfully");
      resetPassword();
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <Person /> },
    { id: "password", label: "Password", icon: <Lock /> },
    { id: "notifications", label: "Notifications", icon: <Notifications /> },
  ];

  return (
    <Container maxWidth="lg" className="py-10">
      <Typography variant="h4" className="font-semibold text-grey-900 dark:text-white mb-6">
        Settings
      </Typography>
      <Box className="max-w-4xl">

      <Box className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <Paper className="md:w-64 p-4 rounded-2xl h-fit">
          <Box className="space-y-1">
            {tabs.map((tab) => (
              <Box
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600"
                    : "hover:bg-grey-100 dark:hover:bg-grey-800 text-grey-600 dark:text-grey-400"
                }`}
              >
                {tab.icon}
                <Typography className="font-medium">{tab.label}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Content */}
        <Box className="flex-1">
          {success && (
            <Alert severity="success" className="mb-6" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" className="mb-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Paper className="p-6 rounded-2xl">
              <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-6">
                Profile Information
              </Typography>

              <Box className="flex items-center gap-4 mb-6">
                <Avatar
                  src={user?.avatar}
                  className="w-20 h-20 bg-primary-100 text-primary-600 text-2xl"
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography className="font-medium text-grey-900 dark:text-white">
                    {user?.name}
                  </Typography>
                  <Typography className="text-sm text-grey-500">
                    {user?.email}
                  </Typography>
                  <Typography className="text-xs text-primary-600 capitalize">
                    {user?.role?.replace("_", " ")}
                  </Typography>
                </Box>
              </Box>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <Box>
                  <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                    Full Name
                  </Typography>
                  <TextField
                    {...registerProfile("name", { required: "Name is required" })}
                    fullWidth
                    error={!!profileErrors.name}
                    helperText={profileErrors.name?.message}
                  />
                </Box>

                <Box>
                  <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                    Email Address
                  </Typography>
                  <TextField
                    {...registerProfile("email")}
                    fullWidth
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Box>

                <Box className="pt-4">
                  <Button type="submit" variant="primary" isLoading={saving} leftIcon={<Save />}>
                    Save Changes
                  </Button>
                </Box>
              </form>
            </Paper>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <Paper className="p-6 rounded-2xl">
              <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-6">
                Change Password
              </Typography>

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <Box>
                  <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                    Current Password
                  </Typography>
                  <TextField
                    {...registerPassword("currentPassword", { required: "Current password is required" })}
                    type={showCurrentPassword ? "text" : "password"}
                    fullWidth
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                    New Password
                  </Typography>
                  <TextField
                    {...registerPassword("newPassword", {
                      required: "New password is required",
                      minLength: { value: 8, message: "Password must be at least 8 characters" },
                    })}
                    type={showNewPassword ? "text" : "password"}
                    fullWidth
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Typography className="text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
                    Confirm New Password
                  </Typography>
                  <TextField
                    {...registerPassword("confirmPassword", { required: "Please confirm your password" })}
                    type="password"
                    fullWidth
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                  />
                </Box>

                <Box className="pt-4">
                  <Button type="submit" variant="primary" isLoading={saving} leftIcon={<Lock />}>
                    Change Password
                  </Button>
                </Box>
              </form>
            </Paper>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Paper className="p-6 rounded-2xl">
              <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-6">
                Notification Preferences
              </Typography>

              <Box className="space-y-4">
                <Box className="flex items-center justify-between p-4 bg-grey-50 dark:bg-grey-800 rounded-xl">
                  <Box>
                    <Typography className="font-medium text-grey-900 dark:text-white">
                      New Applications
                    </Typography>
                    <Typography className="text-sm text-grey-500">
                      Get notified when someone applies to your jobs
                    </Typography>
                  </Box>
                  <Switch defaultChecked color="primary" />
                </Box>

                <Box className="flex items-center justify-between p-4 bg-grey-50 dark:bg-grey-800 rounded-xl">
                  <Box>
                    <Typography className="font-medium text-grey-900 dark:text-white">
                      Application Updates
                    </Typography>
                    <Typography className="text-sm text-grey-500">
                      Get notified when applicants update their status
                    </Typography>
                  </Box>
                  <Switch defaultChecked color="primary" />
                </Box>

                <Box className="flex items-center justify-between p-4 bg-grey-50 dark:bg-grey-800 rounded-xl">
                  <Box>
                    <Typography className="font-medium text-grey-900 dark:text-white">
                      Weekly Reports
                    </Typography>
                    <Typography className="text-sm text-grey-500">
                      Receive weekly recruitment analytics reports
                    </Typography>
                  </Box>
                  <Switch defaultChecked color="primary" />
                </Box>

                <Box className="flex items-center justify-between p-4 bg-grey-50 dark:bg-grey-800 rounded-xl">
                  <Box>
                    <Typography className="font-medium text-grey-900 dark:text-white">
                      Marketing Emails
                    </Typography>
                    <Typography className="text-sm text-grey-500">
                      Receive tips and updates about CareerKart features
                    </Typography>
                  </Box>
                  <Switch color="primary" />
                </Box>
              </Box>

              <Box className="pt-6">
                <Button variant="primary" leftIcon={<Save />}>
                  Save Preferences
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
      </Box>
    </Container>
  );
}
