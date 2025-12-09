"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from "@/lib/api/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { Notification as ApiNotification } from "@/lib/api/notifications";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  CheckCircle,
  Business,
  Person,
  MoreVert,
  Delete,
  DoneAll,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "job_match":
    case "job_recommendation":
      return <WorkIcon className="text-primary-600" />;
    case "application_status":
    case "application_received":
      return <DescriptionIcon className="text-accent-600" />;
    case "interview_scheduled":
      return <CheckCircle className="text-success-600" />;
    case "company_update":
      return <Business className="text-info-600" />;
    case "connection_request":
      return <Person className="text-warning-600" />;
    default:
      return <NotificationsIcon className="text-grey-600" />;
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case "job_match":
    case "job_recommendation":
      return "bg-primary-100 dark:bg-primary-900/30";
    case "application_status":
    case "application_received":
      return "bg-accent-100 dark:bg-accent-900/30";
    case "interview_scheduled":
      return "bg-success-100 dark:bg-success-900/30";
    case "company_update":
      return "bg-info-100 dark:bg-info-900/30";
    case "connection_request":
      return "bg-warning-100 dark:bg-warning-900/30";
    default:
      return "bg-grey-100 dark:bg-grey-800";
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { showSnackbar } = useUIStore();
  const [page, setPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useNotifications(page, 20);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleNotificationClick = async (notification: ApiNotification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await markAsReadMutation.mutateAsync(notification._id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      showSnackbar("All notifications marked as read", "success");
      refetch();
    } catch (error) {
      showSnackbar("Failed to mark all as read", "error");
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotificationId) return;
    try {
      await deleteNotificationMutation.mutateAsync(selectedNotificationId);
      showSnackbar("Notification deleted", "success");
      setMenuAnchor(null);
      setSelectedNotificationId(null);
      refetch();
    } catch (error) {
      showSnackbar("Failed to delete notification", "error");
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedNotificationId(notificationId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedNotificationId(null);
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        <Container maxWidth="lg" className="py-10">
          <div className="flex items-center justify-between mb-4">
            <Typography
              variant="h4"
              className="font-semibold text-grey-900 dark:text-white"
            >
              Notifications
            </Typography>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="small"
                onClick={handleMarkAllAsRead}
                isLoading={markAllAsReadMutation.isPending}
                leftIcon={<DoneAll />}
              >
                Mark all as read
              </Button>
            )}
          </div>

          <Typography variant="body2" className="text-grey-600 dark:text-grey-400 mb-4">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.
          </Typography>

          <Card className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1">
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="80%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-grey-100 dark:bg-grey-800 rounded-full flex items-center justify-center">
                  <NotificationsIcon className="text-grey-400 text-4xl" />
                </div>
                <Typography
                  variant="h6"
                  className="text-grey-600 dark:text-grey-400 mb-2"
                >
                  No notifications yet
                </Typography>
                <Typography
                  variant="body2"
                  className="text-grey-500"
                >
                  We'll notify you when something important happens
                </Typography>
              </div>
            ) : (
              <List>
                {notifications.map((notification, index) => (
                  <div key={notification._id}>
                    <ListItem
                      alignItems="flex-start"
                      className={`px-4 py-3 hover:bg-grey-50 dark:hover:bg-grey-800/50 cursor-pointer transition-colors ${
                        !notification.isRead
                          ? "bg-primary-50/50 dark:bg-primary-900/10"
                          : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          className={`${getNotificationBgColor(notification.type)}`}
                          src={notification.sender?.avatar}
                        >
                          {notification.sender?.name?.charAt(0) || getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <div className="flex items-center gap-2">
                            <Typography
                              variant="subtitle2"
                              className="font-semibold text-grey-900 dark:text-grey-100"
                            >
                              {notification.title}
                            </Typography>
                            {!notification.isRead && (
                              <Chip
                                label="New"
                                size="small"
                                color="primary"
                                className="text-xs"
                              />
                            )}
                          </div>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            className="text-grey-600 dark:text-grey-400 mt-1"
                          >
                            {notification.message}
                          </Typography>
                        }
                      />
                      <div className="flex items-center gap-1">
                        <Typography
                          variant="caption"
                          className="text-grey-500 whitespace-nowrap"
                        >
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: false,
                          })}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, notification._id)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </div>
                    </ListItem>
                    {index < notifications.length - 1 && (
                      <Divider component="li" />
                    )}
                  </div>
                ))}
              </List>
            )}
          </Card>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-grey-600">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}

          {/* Context Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleDeleteNotification}>
              <Delete fontSize="small" className="mr-2" />
              Delete
            </MenuItem>
          </Menu>
        </Container>
      </main>

      <Footer />
    </>
  );
}
