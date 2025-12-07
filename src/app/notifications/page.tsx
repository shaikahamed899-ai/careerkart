"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Notification } from "@/types";
import { getMockNotifications } from "@/lib/api/mock/notifications";
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
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const data = getMockNotifications();
    setNotifications(data);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            {notifications.length > 0 && (
              <Button variant="outline" size="small">
                Mark all as read
              </Button>
            )}
          </div>

          <Typography variant="body2" className="text-grey-600 mb-4">
            You have {unreadCount} unread notifications.
          </Typography>

          <Card className="p-0">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
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
            ) : (
              <List>
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <ListItem
                      alignItems="flex-start"
                      className={`px-4 py-3 hover:bg-grey-50 dark:hover:bg-grey-800/50 cursor-pointer ${
                        !notification.read
                          ? "bg-primary-50/50 dark:bg-primary-900/10"
                          : ""
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
                          <div className="flex items-center gap-2">
                            <Typography
                              variant="subtitle2"
                              className="font-semibold text-grey-900 dark:text-grey-100"
                            >
                              {notification.title}
                            </Typography>
                            {!notification.read && (
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
                            {notification.description}
                          </Typography>
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
                      <Divider component="li" />
                    )}
                  </div>
                ))}
              </List>
            )}
          </Card>
        </Container>
      </main>

      <Footer />
    </>
  );
}
