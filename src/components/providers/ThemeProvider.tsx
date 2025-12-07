"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider as MUIThemeProvider, CssBaseline } from "@mui/material";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/styles/theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Sync with document class for Tailwind dark mode
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <MUIThemeProvider theme={lightTheme}>
        <CssBaseline />
        <div style={{ visibility: "hidden" }}>{children}</div>
      </MUIThemeProvider>
    );
  }

  const theme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
