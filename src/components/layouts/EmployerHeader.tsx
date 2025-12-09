"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Box,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowDown,
  Close as CloseIcon,
  LightMode,
  DarkMode,
  Dashboard,
  Business,
  Work,
  People,
  Analytics,
  Settings,
  Add,
} from "@mui/icons-material";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useUnreadCount } from "@/lib/api/hooks/useNotifications";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const employerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/employer", icon: <Dashboard fontSize="small" /> },
  { label: "Jobs", href: "/employer/jobs", icon: <Work fontSize="small" /> },
  { label: "Applications", href: "/employer/applications", icon: <People fontSize="small" /> },
  { label: "Company", href: "/employer/company", icon: <Business fontSize="small" /> },
  { label: "Analytics", href: "/employer/analytics", icon: <Analytics fontSize="small" /> },
];

export function EmployerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { mode, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { showSnackbar } = useUIStore();

  // Get dynamic unread notification count
  const { data: unreadCount = 0 } = useUnreadCount();

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    setProfileAnchorEl(null);
    showSnackbar("You have been logged out.", "info");
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/employer") {
      return pathname === "/employer";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        className="border-b border-grey-200 dark:border-grey-800 bg-white dark:bg-grey-950"
      >
        <Toolbar className="max-w-7xl mx-auto w-full px-4 md:px-6">
          {/* Logo */}
          <Box className="flex items-center gap-2 mr-8">
            <Logo size="md" />
            <Chip 
              label="Employer" 
              size="small" 
              className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 font-medium"
            />
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center gap-1 flex-1">
              {employerNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-grey-700 dark:text-grey-300 hover:bg-grey-100 dark:hover:bg-grey-800"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Post Job Button - Desktop */}
            {!isMobile && (
              <Button
                variant="primary"
                size="small"
                leftIcon={<Add />}
                onClick={() => router.push("/employer/jobs/new")}
              >
                Post Job
              </Button>
            )}

            {/* Theme Toggle */}
            <IconButton
              onClick={toggleTheme}
              className="text-grey-600 dark:text-grey-400"
              aria-label="Toggle theme"
            >
              {mode === "dark" ? <LightMode /> : <DarkMode />}
            </IconButton>

            {/* Notifications */}
            <IconButton
              className="text-grey-600 dark:text-grey-400"
              onClick={() => router.push("/employer/notifications")}
              aria-label="Open notifications"
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile */}
            <IconButton onClick={handleProfileClick} className="ml-2">
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8"
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <KeyboardArrowDown className="text-grey-600 dark:text-grey-400" />
            </IconButton>

            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => { handleProfileClose(); router.push("/employer/company"); }}>
                Company Profile
              </MenuItem>
              <MenuItem onClick={() => { handleProfileClose(); router.push("/employer/settings"); }}>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>

            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                className="text-grey-600 dark:text-grey-400"
              >
                <MenuIcon />
              </IconButton>
            )}
          </div>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          className: "w-72 bg-white dark:bg-grey-900",
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <Box className="flex items-center gap-2">
              <Logo size="sm" />
              <Chip label="Employer" size="small" className="bg-primary-100 text-primary-700" />
            </Box>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          {/* Post Job Button - Mobile */}
          <Button
            variant="primary"
            fullWidth
            leftIcon={<Add />}
            onClick={() => {
              router.push("/employer/jobs/new");
              setMobileMenuOpen(false);
            }}
            className="mb-4"
          >
            Post New Job
          </Button>

          <List>
            {employerNavItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={isActive(item.href) ? "bg-primary-50 dark:bg-primary-900/30" : ""}
                >
                  <ListItemText 
                    primary={item.label}
                    className={isActive(item.href) ? "text-primary-600" : ""}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider className="my-2" />
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/employer/notifications"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ListItemText primary="Notifications" />
                {unreadCount > 0 && (
                  <Badge badgeContent={unreadCount} color="error" />
                )}
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/employer/settings"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </List>
        </div>
      </Drawer>
    </>
  );
}
