"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useProfile, useUpdateProfile, useUploadAvatar, useUploadResume, useDeleteResume, useAddExperience, useUpdateExperience, useDeleteExperience, useUpdateSkills, useAddEducation, useUpdateEducation, useDeleteEducation } from "@/lib/api/hooks/useUser";
import { Skill, Education } from "@/lib/api/user";
import {
  Container,
  Grid,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Skeleton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField as MuiTextField,
} from "@mui/material";
import {
  Edit,
  CameraAlt,
  Description,
  Delete,
  Add,
  Work,
  School,
  LocationOn,
  Email,
  Phone,
  LinkedIn,
  GitHub,
  Language,
} from "@mui/icons-material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} className="py-4">
      {value === index && children}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuthStore();
  const { showSnackbar } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingEducation, setEditingEducation] = useState<any>(null);
  const [experienceForm, setExperienceForm] = useState({
    company: "",
    title: "",
    employmentType: "full_time",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });
  const [skillsForm, setSkillsForm] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState<Skill>({ name: "", level: "intermediate" });
  const [educationForm, setEducationForm] = useState<Education>({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    grade: "",
    description: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    headline: "",
    summary: "",
    city: "",
    state: "",
    country: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  const { data: profile, isLoading, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const uploadResumeMutation = useUploadResume();
  const deleteResumeMutation = useDeleteResume();
  const addExperienceMutation = useAddExperience();
  const updateExperienceMutation = useUpdateExperience();
  const deleteExperienceMutation = useDeleteExperience();
  const updateSkillsMutation = useUpdateSkills();
  const addEducationMutation = useAddEducation();
  const updateEducationMutation = useUpdateEducation();
  const deleteEducationMutation = useDeleteEducation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        headline: profile.profile?.headline || "",
        summary: profile.profile?.summary || "",
        city: profile.profile?.location?.city || "",
        state: profile.profile?.location?.state || "",
        country: profile.profile?.location?.country || "",
        linkedin: profile.profile?.socialLinks?.linkedin || "",
        github: profile.profile?.socialLinks?.github || "",
        portfolio: profile.profile?.socialLinks?.portfolio || "",
      });
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatarMutation.mutateAsync(file);
      showSnackbar("Profile photo updated!", "success");
      refetch();
      refreshUser();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to upload photo", "error");
    }
  };

  const handleResumeClick = () => {
    resumeInputRef.current?.click();
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadResumeMutation.mutateAsync(file);
      showSnackbar("Resume uploaded successfully!", "success");
      refetch();
      refreshUser();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to upload resume", "error");
    }
  };

  const handleDeleteResume = async () => {
    try {
      await deleteResumeMutation.mutateAsync();
      showSnackbar("Resume deleted", "success");
      refetch();
      refreshUser();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to delete resume", "error");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        profile: {
          headline: formData.headline,
          summary: formData.summary,
          location: {
            city: formData.city,
            state: formData.state,
            country: formData.country,
          },
          socialLinks: {
            linkedin: formData.linkedin,
            github: formData.github,
            portfolio: formData.portfolio,
          },
        },
      });
      showSnackbar("Profile updated successfully!", "success");
      setIsEditing(false);
      refetch();
      refreshUser();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to update profile", "error");
    }
  };

  // Experience handlers
  const handleOpenExperienceDialog = (experience?: any) => {
    if (experience) {
      setEditingExperience(experience);
      setExperienceForm({
        company: experience.company || "",
        title: experience.title || "",
        employmentType: experience.employmentType || "full_time",
        location: experience.location || "",
        startDate: experience.startDate || "",
        endDate: experience.endDate || "",
        isCurrent: experience.isCurrent || false,
        description: experience.description || "",
      });
    } else {
      setEditingExperience(null);
      setExperienceForm({
        company: "",
        title: "",
        employmentType: "full_time",
        location: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      });
    }
    setExperienceDialogOpen(true);
  };

  const handleCloseExperienceDialog = () => {
    setExperienceDialogOpen(false);
    setEditingExperience(null);
    setExperienceForm({
      company: "",
      title: "",
      employmentType: "full_time",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    });
  };

  const handleSaveExperience = async () => {
    try {
      if (editingExperience) {
        await updateExperienceMutation.mutateAsync({
          id: editingExperience._id,
          experience: experienceForm,
        });
        showSnackbar("Experience updated successfully!", "success");
      } else {
        await addExperienceMutation.mutateAsync(experienceForm);
        showSnackbar("Experience added successfully!", "success");
      }
      handleCloseExperienceDialog();
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to save experience", "error");
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    try {
      await deleteExperienceMutation.mutateAsync(experienceId);
      showSnackbar("Experience deleted successfully!", "success");
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to delete experience", "error");
    }
  };

  // Skills handlers
  const handleOpenSkillsDialog = () => {
    setSkillsForm(displayUser?.profile?.skills || []);
    setSkillsDialogOpen(true);
  };

  const handleCloseSkillsDialog = () => {
    setSkillsDialogOpen(false);
    setNewSkill({ name: "", level: "intermediate" });
  };

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkillsForm([...skillsForm, { ...newSkill, name: newSkill.name.trim() }]);
      setNewSkill({ name: "", level: "intermediate" });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkillsForm(skillsForm.filter((_, i) => i !== index));
  };

  const handleSaveSkills = async () => {
    try {
      await updateSkillsMutation.mutateAsync(skillsForm);
      showSnackbar("Skills updated successfully!", "success");
      handleCloseSkillsDialog();
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to save skills", "error");
    }
  };

  // Education handlers
  const handleOpenEducationDialog = (education?: any) => {
    if (education) {
      setEditingEducation(education);
      setEducationForm({
        institution: education.institution || "",
        degree: education.degree || "",
        fieldOfStudy: education.fieldOfStudy || "",
        startDate: education.startDate || "",
        endDate: education.endDate || "",
        isCurrent: education.isCurrent || false,
        grade: education.grade || "",
        description: education.description || "",
      });
    } else {
      setEditingEducation(null);
      setEducationForm({
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        grade: "",
        description: "",
      });
    }
    setEducationDialogOpen(true);
  };

  const handleCloseEducationDialog = () => {
    setEducationDialogOpen(false);
    setEditingEducation(null);
    setEducationForm({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      grade: "",
      description: "",
    });
  };

  const handleSaveEducation = async () => {
    try {
      if (editingEducation) {
        await updateEducationMutation.mutateAsync({
          id: editingEducation._id,
          education: educationForm,
        });
        showSnackbar("Education updated successfully!", "success");
      } else {
        await addEducationMutation.mutateAsync(educationForm);
        showSnackbar("Education added successfully!", "success");
      }
      handleCloseEducationDialog();
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to save education", "error");
    }
  };

  const handleDeleteEducation = async (educationId: string) => {
    try {
      await deleteEducationMutation.mutateAsync(educationId);
      showSnackbar("Education deleted successfully!", "success");
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to delete education", "error");
    }
  };

  const displayUser = profile || user;
  const profileCompletion = displayUser?.profileCompletion || 0;

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
          <Container maxWidth="lg" className="py-10">
            <Skeleton variant="text" width={200} height={40} className="mb-6" />
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={300} className="rounded-lg" />
              </Grid>
              <Grid item xs={12} md={8}>
                <Skeleton variant="rectangular" height={400} className="rounded-lg" />
              </Grid>
            </Grid>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={resumeInputRef}
        onChange={handleResumeChange}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        <Container maxWidth="lg" className="py-10">
          <div className="flex items-center justify-between mb-6">
            <Typography
              variant="h4"
              className="font-semibold text-grey-900 dark:text-white"
            >
              My Profile
            </Typography>
            {!isEditing && (
              <Button
                variant="outline"
                leftIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          <Grid container spacing={4}>
            {/* Left Column - Profile Card */}
            <Grid item xs={12} md={4}>
              <Card className="p-6 flex flex-col items-center gap-4">
                {/* Avatar with edit button */}
                <div className="relative">
                  <Avatar
                    src={displayUser?.avatar}
                    alt={displayUser?.name}
                    className="w-28 h-28 text-4xl"
                  >
                    {displayUser?.name?.charAt(0) ?? "U"}
                  </Avatar>
                  <IconButton
                    size="small"
                    className="absolute bottom-0 right-0 bg-primary-600 text-white hover:bg-primary-700"
                    onClick={handleAvatarClick}
                  >
                    <CameraAlt fontSize="small" />
                  </IconButton>
                </div>

                <div className="text-center">
                  <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white">
                    {displayUser?.name ?? "Guest User"}
                  </Typography>
                  {displayUser?.profile?.headline && (
                    <Typography variant="body2" className="text-grey-600 dark:text-grey-400 mt-1">
                      {displayUser.profile.headline}
                    </Typography>
                  )}
                  <Typography variant="body2" className="text-grey-500 mt-1">
                    {displayUser?.email ?? "Not signed in"}
                  </Typography>
                </div>

                {/* Profile Completion */}
                <div className="w-full">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-grey-600 dark:text-grey-400">Profile Completion</span>
                    <span className="font-semibold text-primary-600">{profileCompletion}%</span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={profileCompletion}
                    className="h-2 rounded-full"
                  />
                </div>

                {/* Resume Section */}
                <div className="w-full pt-4 border-t border-grey-200 dark:border-grey-700">
                  <Typography variant="subtitle2" className="font-semibold mb-3">
                    Resume
                  </Typography>
                  {displayUser?.resume?.url ? (
                    <div className="flex items-center justify-between p-3 bg-grey-50 dark:bg-grey-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Description className="text-primary-600" />
                        <div>
                          <Typography variant="body2" className="font-medium">
                            {displayUser.resume.fileName || "Resume.pdf"}
                          </Typography>
                          <Typography variant="caption" className="text-grey-500">
                            Uploaded
                          </Typography>
                        </div>
                      </div>
                      <IconButton
                        size="small"
                        onClick={handleDeleteResume}
                        className="text-error-500"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<Add />}
                      onClick={handleResumeClick}
                      isLoading={uploadResumeMutation.isPending}
                    >
                      Upload Resume
                    </Button>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-grey-200 dark:border-grey-700">
                  <div className="text-center p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                    <Typography variant="h5" className="font-bold text-primary-600">
                      {displayUser?.savedJobs?.length || 0}
                    </Typography>
                    <Typography variant="caption" className="text-grey-600">
                      Saved Jobs
                    </Typography>
                  </div>
                  <div className="text-center p-3 bg-success-50 dark:bg-success-900/30 rounded-lg">
                    <Typography variant="h5" className="font-bold text-success-600">
                      {displayUser?.followingCompanies?.length || 0}
                    </Typography>
                    <Typography variant="caption" className="text-grey-600">
                      Following
                    </Typography>
                  </div>
                </div>
              </Card>
            </Grid>

            {/* Right Column - Details */}
            <Grid item xs={12} md={8}>
              <Card className="p-6">
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  className="border-b border-grey-200 dark:border-grey-700"
                >
                  <Tab label="Personal Info" />
                  <Tab label="Experience" />
                  <Tab label="Education" />
                  <Tab label="Skills" />
                </Tabs>

                {/* Personal Info Tab */}
                <TabPanel value={activeTab} index={0}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        leftIcon={<Edit className="text-grey-400" />}
                      />
                      <TextField
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        leftIcon={<Phone className="text-grey-400" />}
                      />
                    </div>

                    <TextField
                      label="Professional Headline"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g., Senior Software Engineer at Google"
                    />

                    <TextField
                      label="Professional Summary"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      disabled={!isEditing}
                      multiline
                      rows={4}
                      placeholder="Tell us about your experience, skills and career goals"
                    />

                    <Typography variant="subtitle2" className="font-semibold mt-4">
                      Location
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <TextField
                        label="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={!isEditing}
                      />
                      <TextField
                        label="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        disabled={!isEditing}
                      />
                      <TextField
                        label="Country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>

                    <Typography variant="subtitle2" className="font-semibold mt-4">
                      Social Links
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        label="LinkedIn"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        disabled={!isEditing}
                        leftIcon={<LinkedIn className="text-grey-400" />}
                        placeholder="https://linkedin.com/in/username"
                      />
                      <TextField
                        label="GitHub"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        disabled={!isEditing}
                        leftIcon={<GitHub className="text-grey-400" />}
                        placeholder="https://github.com/username"
                      />
                      <TextField
                        label="Portfolio"
                        value={formData.portfolio}
                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                        disabled={!isEditing}
                        leftIcon={<Language className="text-grey-400" />}
                        placeholder="https://yourportfolio.com"
                        className="md:col-span-2"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSaveProfile}
                          isLoading={updateProfileMutation.isPending}
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </TabPanel>

                {/* Experience Tab */}
                <TabPanel value={activeTab} index={1}>
                  <div className="space-y-4">
                    {displayUser?.experience && displayUser.experience.length > 0 ? (
                      displayUser.experience.map((exp: any) => (
                        <Card key={exp._id} variant="outlined" className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              <Work className="text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <Typography variant="subtitle1" className="font-semibold">
                                {exp.title}
                              </Typography>
                              <Typography variant="body2" className="text-grey-600">
                                {exp.company} • {exp.employmentType?.replace('_', ' ')}
                              </Typography>
                              <Typography variant="caption" className="text-grey-500">
                                {exp.startDate && new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : exp.endDate && new Date(exp.endDate).getFullYear()}
                                {exp.location && ` • ${exp.location}`}
                              </Typography>
                              {exp.description && (
                                <Typography variant="body2" className="mt-2 text-grey-700 dark:text-grey-300">
                                  {exp.description}
                                </Typography>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenExperienceDialog(exp)}
                                className="text-primary-600"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteExperience(exp._id)}
                                className="text-error-500"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Work className="text-5xl text-grey-300 mb-3" />
                        <Typography variant="body1" className="text-grey-500 mb-3">
                          No experience added yet
                        </Typography>
                        <Button variant="outline" leftIcon={<Add />} onClick={() => handleOpenExperienceDialog()}>
                          Add Experience
                        </Button>
                      </div>
                    )}
                  </div>
                </TabPanel>

                {/* Education Tab */}
                <TabPanel value={activeTab} index={2}>
                  <div className="space-y-4">
                    {displayUser?.education && displayUser.education.length > 0 ? (
                      displayUser.education.map((edu: any) => (
                        <Card key={edu._id} variant="outlined" className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                              <School className="text-accent-600" />
                            </div>
                            <div className="flex-1">
                              <Typography variant="subtitle1" className="font-semibold">
                                {edu.degree} in {edu.fieldOfStudy}
                              </Typography>
                              <Typography variant="body2" className="text-grey-600">
                                {edu.institution}
                              </Typography>
                              <Typography variant="caption" className="text-grey-500">
                                {edu.startDate && new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                                {edu.grade && ` • ${edu.grade}`}
                              </Typography>
                            </div>
                            <div className="flex gap-2">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEducationDialog(edu)}
                                className="text-primary-600"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteEducation(edu._id)}
                                className="text-error-500"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <School className="text-5xl text-grey-300 mb-3" />
                        <Typography variant="body1" className="text-grey-500 mb-3">
                          No education added yet
                        </Typography>
                        <Button variant="outline" leftIcon={<Add />} onClick={() => handleOpenEducationDialog()}>
                          Add Education
                        </Button>
                      </div>
                    )}
                  </div>
                </TabPanel>

                {/* Skills Tab */}
                <TabPanel value={activeTab} index={3}>
                  <div className="space-y-4">
                    {displayUser?.profile?.skills && displayUser.profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {displayUser.profile.skills.map((skill: any, idx: number) => (
                          <Chip
                            key={idx}
                            label={`${skill.name} • ${skill.level}`}
                            className="capitalize"
                            color={skill.level === 'advanced' || skill.level === 'expert' ? 'primary' : 'default'}
                          />
                        ))}
                        <Button variant="outline" size="small" leftIcon={<Edit />} onClick={handleOpenSkillsDialog}>
                          Edit Skills
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Typography variant="body1" className="text-grey-500 mb-3">
                          No skills added yet
                        </Typography>
                        <Button variant="outline" leftIcon={<Add />} onClick={handleOpenSkillsDialog}>
                          Add Skills
                        </Button>
                      </div>
                    )}
                  </div>
                </TabPanel>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </main>

      <Footer />

      {/* Experience Dialog */}
      <Dialog open={experienceDialogOpen} onClose={handleCloseExperienceDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExperience ? "Edit Experience" : "Add Experience"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MuiTextField
                label="Job Title"
                value={experienceForm.title}
                onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                fullWidth
                required
              />
              <MuiTextField
                label="Company"
                value={experienceForm.company}
                onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                fullWidth
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={experienceForm.employmentType}
                  label="Employment Type"
                  onChange={(e) => setExperienceForm({ ...experienceForm, employmentType: e.target.value })}
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                  <MenuItem value="freelance">Freelance</MenuItem>
                </Select>
              </FormControl>
              
              <MuiTextField
                label="Location"
                value={experienceForm.location}
                onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MuiTextField
                label="Start Date"
                type="month"
                value={experienceForm.startDate}
                onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                fullWidth
                required
              />
              <MuiTextField
                label="End Date"
                type="month"
                value={experienceForm.endDate}
                onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                fullWidth
                disabled={experienceForm.isCurrent}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCurrent"
                checked={experienceForm.isCurrent}
                onChange={(e) => setExperienceForm({ ...experienceForm, isCurrent: e.target.checked, endDate: "" })}
                className="mr-2"
              />
              <label htmlFor="isCurrent">I currently work here</label>
            </div>

            <MuiTextField
              label="Job Description"
              multiline
              rows={4}
              value={experienceForm.description}
              onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
              fullWidth
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExperienceDialog} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSaveExperience}
            variant="primary"
            isLoading={addExperienceMutation.isPending || updateExperienceMutation.isPending}
          >
            {editingExperience ? "Update" : "Add"} Experience
          </Button>
        </DialogActions>
      </Dialog>

      {/* Skills Dialog */}
      <Dialog open={skillsDialogOpen} onClose={handleCloseSkillsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Manage Skills</DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            {/* Add new skill */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <MuiTextField
                  label="Skill Name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="e.g., JavaScript, Project Management"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
              </div>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Level</InputLabel>
                <Select
                  value={newSkill.level}
                  label="Level"
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                </Select>
              </FormControl>
              <Button onClick={handleAddSkill} variant="outline">
                Add
              </Button>
            </div>

            {/* Current skills */}
            <div className="space-y-2">
              <Typography variant="subtitle2" className="font-semibold">
                Current Skills
              </Typography>
              {skillsForm.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skillsForm.map((skill, index) => (
                    <Chip
                      key={index}
                      label={`${skill.name} • ${skill.level}`}
                      onDelete={() => handleRemoveSkill(index)}
                      color="primary"
                      className="capitalize"
                    />
                  ))}
                </div>
              ) : (
                <Typography variant="body2" className="text-grey-500">
                  No skills added yet
                </Typography>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSkillsDialog} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSaveSkills}
            variant="primary"
            isLoading={updateSkillsMutation.isPending}
          >
            Save Skills
          </Button>
        </DialogActions>
      </Dialog>

      {/* Education Dialog */}
      <Dialog open={educationDialogOpen} onClose={handleCloseEducationDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEducation ? "Edit Education" : "Add Education"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MuiTextField
                label="Institution"
                value={educationForm.institution}
                onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                fullWidth
                required
              />
              <MuiTextField
                label="Degree"
                value={educationForm.degree}
                onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                fullWidth
                required
              />
            </div>
            
            <MuiTextField
              label="Field of Study"
              value={educationForm.fieldOfStudy}
              onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MuiTextField
                label="Start Date"
                type="month"
                value={educationForm.startDate}
                onChange={(e) => setEducationForm({ ...educationForm, startDate: e.target.value })}
                fullWidth
                required
              />
              <MuiTextField
                label="End Date"
                type="month"
                value={educationForm.endDate}
                onChange={(e) => setEducationForm({ ...educationForm, endDate: e.target.value })}
                fullWidth
                disabled={educationForm.isCurrent}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrentEducation"
                checked={educationForm.isCurrent}
                onChange={(e) => setEducationForm({ ...educationForm, isCurrent: e.target.checked, endDate: "" })}
                className="rounded border-grey-300"
              />
              <label htmlFor="isCurrentEducation" className="text-sm text-grey-700">
                Currently studying here
              </label>
            </div>

            <MuiTextField
              label="Grade/CGPA"
              value={educationForm.grade}
              onChange={(e) => setEducationForm({ ...educationForm, grade: e.target.value })}
              fullWidth
              placeholder="e.g., 3.8, First Class, A+"
            />

            <MuiTextField
              label="Description"
              value={educationForm.description}
              onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Additional details about your education..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEducationDialog} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSaveEducation}
            variant="primary"
            isLoading={addEducationMutation.isPending || updateEducationMutation.isPending}
          >
            {editingEducation ? "Update Education" : "Add Education"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
