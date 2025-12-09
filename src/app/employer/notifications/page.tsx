"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from "@/lib/api/hooks/useNotifications";
import { useUIStore } from "@/store/uiStore";
import { Notification as ApiNotification } from "@/lib/api/notifications";
import {
  Box,
  Typography,
  Paper,
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
  Tabs,
  Tab,
  Container,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  CheckCircle,
  Business,
  Person,
  MoreVert,
  Delete,
  DoneAll,
  Schedule,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/Button";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "application_received":
    case "new_application":
      return <DescriptionIcon className="text-primary-600" />;
    case "interview_scheduled":
      return <Schedule className="text-orange-600" />;
    case "application_withdrawn":
      return <Person className="text-warning-600" />;
    case "job_expired":
      return <WorkIcon className="text-grey-600" />;
    case "company_verified":
      return <CheckCircle className="text-success-600" />;
    default:
      return <NotificationsIcon className="text-grey-600" />;
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case "application_received":
    case "new_application":
      return "bg-primary-100 dark:bg-primary-900/30";
    case "interview_scheduled":
      return "bg-orange-100 dark:bg-orange-900/30";
    case "application_withdrawn":
      return "bg-warning-100 dark:bg-warning-900/30";
    case "job_expired":
      return "bg-grey-100 dark:bg-grey-800";
    case "company_verified":
      return "bg-success-100 dark:bg-success-900/30";
    default:
      return "bg-grey-100 dark:bg-grey-800";
  }
};

export default function EmployerNotificationsPage() {
  const router = useRouter();
  const { showSnackbar } = useUIStore();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  const unreadOnly = activeTab === 1;
  const { data, isLoading, refetch } = useNotifications(page, 20, undefined, unreadOnly);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notification: ApiNotification) => {
    if (!notification.isRead) {
      try {
        await markAsReadMutation.mutateAsync(notification._id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

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
    <Container maxWidth="lg" className="py-10">
      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Box>
          <Typography variant="h4" className="font-semibold text-grey-900 dark:text-white">
            Notifications
          </Typography>
          <Typography className="text-grey-500">
            Stay updated with your recruitment activities
          </Typography>
        </Box>
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
      </Box>

      <Paper className="rounded-2xl overflow-hidden">
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          className="border-b border-grey-200 dark:border-grey-700 px-4"
        >
          <Tab label="All" />
          <Tab label={`Unread (${unreadCount})`} />
        </Tabs>

        {isLoading ? (
          <Box className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} className="flex items-start gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <Box className="flex-1">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" />
                </Box>
              </Box>
            ))}
          </Box>
        ) : notifications.length === 0 ? (
          <Box className="p-12 text-center">
            <Box className="w-24 h-24 mx-auto mb-4 bg-grey-100 dark:bg-grey-800 rounded-full flex items-center justify-center">
              <NotificationsIcon className="text-grey-400 text-4xl" />
            </Box>
            <Typography variant="h6" className="text-grey-600 dark:text-grey-400 mb-2">
              {activeTab === 1 ? "No unread notifications" : "No notifications yet"}
            </Typography>
            <Typography className="text-grey-500">
              {activeTab === 1 
                ? "You're all caught up!" 
                : "We'll notify you when candidates apply to your jobs"}
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <Box key={notification._id}>
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
                    <Avatar className={`${getNotificationBgColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box className="flex items-center gap-2">
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
                      </Box>
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
                  <Box className="flex items-center gap-1">
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
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && (
                  <Divider component="li" />
                )}
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Box className="flex justify-center gap-2 mt-6">
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
        </Box>
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
  );
}
