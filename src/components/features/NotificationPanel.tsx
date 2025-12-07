"use client";

import {
  Popover,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { Button } from "@/components/ui/Button";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotificationPanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "job_match":
      return <WorkIcon className="text-primary-600" />;
    case "resume_score":
      return <DescriptionIcon className="text-accent-600" />;
    case "application":
      return <InfoIcon className="text-success-600" />;
    default:
      return <NotificationsIcon className="text-grey-600" />;
  }
};

const getNotificationBgColor = (type: Notification["type"]) => {
  switch (type) {
    case "job_match":
      return "bg-primary-100 dark:bg-primary-900/30";
    case "resume_score":
      return "bg-accent-100 dark:bg-accent-900/30";
    case "application":
      return "bg-success-100 dark:bg-success-900/30";
    default:
      return "bg-grey-100 dark:bg-grey-800";
  }
};

export function NotificationPanel({
  anchorEl,
  open,
  onClose,
  notifications,
}: NotificationPanelProps) {
  const hasNotifications = notifications.length > 0;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        className: "w-96 max-h-[480px] rounded-xl shadow-dropdown",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-grey-200 dark:border-grey-800">
        <Typography variant="h6" className="font-semibold">
          Notifications
        </Typography>
        <Link
          href="/notifications"
          className="text-primary-600 text-sm font-medium hover:underline"
          onClick={onClose}
        >
          View All
        </Link>
      </div>

      {/* Notification List */}
      {hasNotifications ? (
        <List className="p-0 max-h-[360px] overflow-y-auto">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <ListItem
                alignItems="flex-start"
                className={`px-4 py-3 hover:bg-grey-50 dark:hover:bg-grey-800/50 cursor-pointer ${
                  !notification.read ? "bg-primary-50/50 dark:bg-primary-900/10" : ""
                }`}
              >
                <ListItemAvatar>
                  <Avatar
                    className={`${getNotificationBgColor(notification.type)}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      className="font-semibold text-grey-900 dark:text-grey-100"
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <div className="mt-1">
                      <Typography
                        variant="body2"
                        className="text-grey-600 dark:text-grey-400 line-clamp-2"
                      >
                        {notification.description}
                      </Typography>
                      {notification.actionLabel && (
                        <Button
                          variant="outline"
                          size="small"
                          className="mt-2 text-xs py-1 px-3"
                        >
                          {notification.actionLabel}
                        </Button>
                      )}
                    </div>
                  }
                />
                <Typography
                  variant="caption"
                  className="text-grey-500 whitespace-nowrap ml-2"
                >
                  {formatDistanceToNow(new Date(notification.timestamp), {
                    addSuffix: false,
                  })}
                </Typography>
              </ListItem>
              {index < notifications.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </div>
          ))}
        </List>
      ) : (
        /* Empty State */
        <div className="p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-grey-100 dark:bg-grey-800 rounded-full flex items-center justify-center">
            <NotificationsIcon className="text-grey-400 text-4xl" />
          </div>
          <Typography
            variant="body1"
            className="text-grey-600 dark:text-grey-400"
          >
            No Notification Found
          </Typography>
        </div>
      )}
    </Popover>
  );
}
