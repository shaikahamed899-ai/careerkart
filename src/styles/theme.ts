"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

// Design tokens extracted from PNG designs
export const designTokens = {
  colors: {
    primary: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A",
      950: "#172554",
    },
    accent: {
      50: "#FEFCE8",
      100: "#FEF9C3",
      200: "#FEF08A",
      300: "#FDE047",
      400: "#FACC15",
      500: "#EAB308",
      600: "#CA8A04",
      700: "#A16207",
      800: "#854D0E",
      900: "#713F12",
    },
    grey: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#E5E5E5",
      300: "#D4D4D4",
      400: "#A3A3A3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0A0A0A",
    },
    success: {
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B",
    },
    error: {
      50: "#FEF2F2",
      100: "#FEE2E2",
      200: "#FECACA",
      300: "#FCA5A5",
      400: "#F87171",
      500: "#EF4444",
      600: "#DC2626",
      700: "#B91C1C",
      800: "#991B1B",
      900: "#7F1D1D",
    },
    warning: {
      50: "#FFF7ED",
      100: "#FFEDD5",
      200: "#FED7AA",
      300: "#FDBA74",
      400: "#FB923C",
      500: "#F97316",
      600: "#EA580C",
      700: "#C2410C",
      800: "#9A3412",
      900: "#7C2D12",
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    desktop: {
      h1: { fontSize: "56px", lineHeight: "100%", fontWeight: 700 },
      h2: { fontSize: "40px", lineHeight: "110%", fontWeight: 700 },
      h3: { fontSize: "32px", lineHeight: "120%", fontWeight: 600 },
      h4: { fontSize: "24px", lineHeight: "140%", fontWeight: 600 },
      h5: { fontSize: "20px", lineHeight: "140%", fontWeight: 500 },
      h6: { fontSize: "16px", lineHeight: "150%", fontWeight: 500 },
    },
    tablet: {
      h1: { fontSize: "32px", lineHeight: "100%", fontWeight: 700 },
      h2: { fontSize: "24px", lineHeight: "110%", fontWeight: 700 },
      h3: { fontSize: "20px", lineHeight: "120%", fontWeight: 600 },
      h4: { fontSize: "18px", lineHeight: "140%", fontWeight: 600 },
      h5: { fontSize: "16px", lineHeight: "140%", fontWeight: 500 },
      h6: { fontSize: "15px", lineHeight: "150%", fontWeight: 500 },
    },
    mobile: {
      h1: { fontSize: "28px", lineHeight: "120%", fontWeight: 700 },
      h2: { fontSize: "22px", lineHeight: "120%", fontWeight: 700 },
      h3: { fontSize: "18px", lineHeight: "140%", fontWeight: 600 },
      h4: { fontSize: "16px", lineHeight: "140%", fontWeight: 600 },
      h5: { fontSize: "14px", lineHeight: "140%", fontWeight: 500 },
      h6: { fontSize: "14px", lineHeight: "140%", fontWeight: 500 },
    },
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    full: "9999px",
  },
  shadows: {
    card: "0px 4px 16px rgba(0, 0, 0, 0.08)",
    dropdown: "0px 8px 24px rgba(0, 0, 0, 0.12)",
    modal: "0px 16px 48px rgba(0, 0, 0, 0.16)",
  },
};

// Common theme options shared between light and dark modes
const commonThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: designTokens.typography.fontFamily,
    h1: {
      fontSize: designTokens.typography.desktop.h1.fontSize,
      lineHeight: designTokens.typography.desktop.h1.lineHeight,
      fontWeight: designTokens.typography.desktop.h1.fontWeight,
    },
    h2: {
      fontSize: designTokens.typography.desktop.h2.fontSize,
      lineHeight: designTokens.typography.desktop.h2.lineHeight,
      fontWeight: designTokens.typography.desktop.h2.fontWeight,
    },
    h3: {
      fontSize: designTokens.typography.desktop.h3.fontSize,
      lineHeight: designTokens.typography.desktop.h3.lineHeight,
      fontWeight: designTokens.typography.desktop.h3.fontWeight,
    },
    h4: {
      fontSize: designTokens.typography.desktop.h4.fontSize,
      lineHeight: designTokens.typography.desktop.h4.lineHeight,
      fontWeight: designTokens.typography.desktop.h4.fontWeight,
    },
    h5: {
      fontSize: designTokens.typography.desktop.h5.fontSize,
      lineHeight: designTokens.typography.desktop.h5.lineHeight,
      fontWeight: designTokens.typography.desktop.h5.fontWeight,
    },
    h6: {
      fontSize: designTokens.typography.desktop.h6.fontSize,
      lineHeight: designTokens.typography.desktop.h6.lineHeight,
      fontWeight: designTokens.typography.desktop.h6.fontWeight,
    },
    body1: {
      fontSize: "16px",
      lineHeight: "150%",
    },
    body2: {
      fontSize: "14px",
      lineHeight: "150%",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.full,
          padding: "10px 24px",
          fontWeight: 500,
          fontSize: "16px",
        },
        containedPrimary: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        outlinedPrimary: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: designTokens.borderRadius.md,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.card,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.full,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: designTokens.borderRadius.xl,
          boxShadow: designTokens.shadows.modal,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: designTokens.borderRadius.md,
          fontSize: "14px",
          padding: "8px 12px",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "16px",
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: "light",
    primary: {
      main: designTokens.colors.primary[600],
      light: designTokens.colors.primary[400],
      dark: designTokens.colors.primary[800],
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: designTokens.colors.accent[500],
      light: designTokens.colors.accent[300],
      dark: designTokens.colors.accent[700],
      contrastText: "#000000",
    },
    error: {
      main: designTokens.colors.error[500],
      light: designTokens.colors.error[300],
      dark: designTokens.colors.error[700],
    },
    warning: {
      main: designTokens.colors.warning[500],
      light: designTokens.colors.warning[300],
      dark: designTokens.colors.warning[700],
    },
    success: {
      main: designTokens.colors.success[500],
      light: designTokens.colors.success[300],
      dark: designTokens.colors.success[700],
    },
    grey: designTokens.colors.grey,
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: designTokens.colors.grey[900],
      secondary: designTokens.colors.grey[600],
    },
    divider: designTokens.colors.grey[200],
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: "dark",
    primary: {
      main: designTokens.colors.primary[500],
      light: designTokens.colors.primary[300],
      dark: designTokens.colors.primary[700],
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: designTokens.colors.accent[400],
      light: designTokens.colors.accent[200],
      dark: designTokens.colors.accent[600],
      contrastText: "#000000",
    },
    error: {
      main: designTokens.colors.error[400],
      light: designTokens.colors.error[200],
      dark: designTokens.colors.error[600],
    },
    warning: {
      main: designTokens.colors.warning[400],
      light: designTokens.colors.warning[200],
      dark: designTokens.colors.warning[600],
    },
    success: {
      main: designTokens.colors.success[400],
      light: designTokens.colors.success[200],
      dark: designTokens.colors.success[600],
    },
    grey: designTokens.colors.grey,
    background: {
      default: designTokens.colors.grey[950],
      paper: designTokens.colors.grey[900],
    },
    text: {
      primary: designTokens.colors.grey[50],
      secondary: designTokens.colors.grey[400],
    },
    divider: designTokens.colors.grey[800],
  },
});
