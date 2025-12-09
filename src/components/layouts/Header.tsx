"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowDown,
  Close as CloseIcon,
  LightMode,
  DarkMode,
} from "@mui/icons-material";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useUnreadCount } from "@/lib/api/hooks/useNotifications";
import clsx from "clsx";

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

const publicNavItems: NavItem[] = [
  { label: "How We Work", href: "/how-we-work" },
  { label: "About Us", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

const authenticatedNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "My Network", href: "/network" },
  { label: "Explore", href: "/explore", hasDropdown: true },
];

export function Header() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { mode, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const {
    openSignIn,
    openSignUp,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    showSnackbar,
  } = useUIStore();

  // Get dynamic unread notification count
  const { data: unreadCount = 0 } = useUnreadCount();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const handleExploreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setProfileAnchorEl(null);
    showSnackbar("You have been logged out.", "info");
    router.push("/");
  };

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

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
          <Logo size="md" className="mr-8" />

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center gap-6 flex-1">
              {navItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.hasDropdown ? (
                    <button
                      onClick={handleExploreClick}
                      className="flex items-center gap-1 text-grey-700 dark:text-grey-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                    >
                      {item.label}
                      <KeyboardArrowDown fontSize="small" />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-grey-700 dark:text-grey-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Theme Toggle */}
            <IconButton
              onClick={toggleTheme}
              className="text-grey-600 dark:text-grey-400"
              aria-label="Toggle theme"
            >
              {mode === "dark" ? <LightMode /> : <DarkMode />}
            </IconButton>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <IconButton
                  className="text-grey-600 dark:text-grey-400"
                  onClick={() => router.push("/notifications")}
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
                  <MenuItem onClick={handleProfileClose}>
                    <Link href="/profile">My Profile</Link>
                  </MenuItem>
                  <MenuItem onClick={handleProfileClose}>
                    <Link href="/settings">Settings</Link>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {!isMobile && (
                  <>
                    <Button variant="outline" onClick={openSignIn}>
                      Login
                    </Button>
                    <Button variant="primary" onClick={openSignUp}>
                      Sign Up
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                onClick={toggleMobileMenu}
                className="text-grey-600 dark:text-grey-400"
              >
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </div>
        </Toolbar>
      </AppBar>

      {/* Explore Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <MenuItem onClick={handleClose}>
          <Link href="/explore/companies">Companies</Link>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Link href="/explore/salaries">Salaries</Link>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Link href="/explore/interviews">Interviews</Link>
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={isMobileMenuOpen}
        onClose={closeMobileMenu}
        PaperProps={{
          className: "w-72 bg-white dark:bg-grey-900",
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <Logo size="sm" />
            <IconButton onClick={closeMobileMenu}>
              <CloseIcon />
            </IconButton>
          </div>

          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={closeMobileMenu}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider className="my-4" />

          {!isAuthenticated && (
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  closeMobileMenu();
                  openSignIn();
                }}
              >
                Login
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  closeMobileMenu();
                  openSignUp();
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
