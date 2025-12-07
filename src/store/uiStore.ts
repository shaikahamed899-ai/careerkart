"use client";

import { create } from "zustand";

interface UIState {
  // Modal states
  isSignInOpen: boolean;
  isSignUpOpen: boolean;
  isResumeUploadOpen: boolean;
  isNotificationOpen: boolean;
  isMobileMenuOpen: boolean;

  // Snackbar state
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  };

  // Actions
  openSignIn: () => void;
  closeSignIn: () => void;
  openSignUp: () => void;
  closeSignUp: () => void;
  openResumeUpload: () => void;
  closeResumeUpload: () => void;
  openNotification: () => void;
  closeNotification: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  showSnackbar: (
    message: string,
    severity?: "success" | "error" | "warning" | "info"
  ) => void;
  hideSnackbar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial states
  isSignInOpen: false,
  isSignUpOpen: false,
  isResumeUploadOpen: false,
  isNotificationOpen: false,
  isMobileMenuOpen: false,
  snackbar: {
    open: false,
    message: "",
    severity: "info",
  },

  // Actions
  openSignIn: () => set({ isSignInOpen: true, isSignUpOpen: false }),
  closeSignIn: () => set({ isSignInOpen: false }),
  openSignUp: () => set({ isSignUpOpen: true, isSignInOpen: false }),
  closeSignUp: () => set({ isSignUpOpen: false }),
  openResumeUpload: () => set({ isResumeUploadOpen: true }),
  closeResumeUpload: () => set({ isResumeUploadOpen: false }),
  openNotification: () => set({ isNotificationOpen: true }),
  closeNotification: () => set({ isNotificationOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  showSnackbar: (message, severity = "info") =>
    set({ snackbar: { open: true, message, severity } }),
  hideSnackbar: () =>
    set((state) => ({ snackbar: { ...state.snackbar, open: false } })),
}));
