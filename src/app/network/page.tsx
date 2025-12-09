"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { networkApi, Connection, ConnectionRequest, UserSuggestion } from "@/lib/api/network";
import {
  Container,
  Typography,
  Grid,
  Avatar,
  Chip,
  Skeleton,
  Tabs,
  Tab,
  Box,
  IconButton,
} from "@mui/material";
import {
  PersonAdd,
  PersonRemove,
  Check,
  Close,
  Search,
  People,
  Send,
  LocationOn,
} from "@mui/icons-material";

export default function NetworkPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { showSnackbar } = useUIStore();
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    fetchData();
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connectionsRes, pendingRes, sentRes, suggestionsRes] = await Promise.all([
        networkApi.getConnections(1, 50),
        networkApi.getPendingRequests(1, 50, "received"),
        networkApi.getPendingRequests(1, 50, "sent"),
        networkApi.getSuggestions(20),
      ]);

      setConnections(connectionsRes.data || []);
      setPendingRequests(pendingRes.data || []);
      setSentRequests(sentRes.data || []);
      setSuggestions(suggestionsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch network data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: string) => {
    setActionLoading(userId);
    try {
      await networkApi.sendConnectionRequest(userId);
      showSnackbar("Connection request sent!", "success");
      fetchData();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to send request", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (connectionId: string) => {
    setActionLoading(connectionId);
    try {
      await networkApi.acceptConnection(connectionId);
      showSnackbar("Connection accepted!", "success");
      fetchData();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to accept", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (connectionId: string) => {
    setActionLoading(connectionId);
    try {
      await networkApi.rejectConnection(connectionId);
      showSnackbar("Connection rejected", "info");
      fetchData();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to reject", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await networkApi.removeConnection(userId);
      showSnackbar("Connection removed", "info");
      fetchData();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to remove", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredConnections = connections.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.profile?.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        <Container maxWidth="lg" className="py-10">
          <Typography
            variant="h4"
            className="font-semibold mb-2 text-grey-900 dark:text-white"
          >
            My Network
          </Typography>
          <Typography className="text-grey-600 dark:text-grey-400 mb-6">
            Manage your professional connections
          </Typography>

          <Card className="mb-6">
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              className="border-b border-grey-200 dark:border-grey-700"
            >
              <Tab label={`Connections (${connections.length})`} />
              <Tab label={`Pending (${pendingRequests.length})`} />
              <Tab label={`Sent (${sentRequests.length})`} />
              <Tab label="Suggestions" />
            </Tabs>

            {/* Connections Tab */}
            {activeTab === 0 && (
              <Box className="p-4">
                <TextField
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                  leftIcon={<Search className="text-grey-400" />}
                  className="mb-4"
                />

                {loading ? (
                  <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        <Skeleton variant="rounded" height={150} />
                      </Grid>
                    ))}
                  </Grid>
                ) : filteredConnections.length === 0 ? (
                  <Box className="text-center py-12">
                    <People className="text-grey-300 text-6xl mb-4" />
                    <Typography variant="h6" className="text-grey-600 mb-2">
                      {searchQuery ? "No connections found" : "No connections yet"}
                    </Typography>
                    <Typography className="text-grey-500 mb-4">
                      {searchQuery
                        ? "Try a different search term"
                        : "Start building your professional network"}
                    </Typography>
                    {!searchQuery && (
                      <Button variant="primary" onClick={() => setActiveTab(3)}>
                        Find People
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {filteredConnections.map((connection) => (
                      <Grid item xs={12} sm={6} md={4} key={connection._id}>
                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <Box className="flex items-start gap-3">
                            <Avatar
                              src={connection.user.avatar}
                              className="w-14 h-14 bg-primary-100 text-primary-600"
                            >
                              {connection.user.name.charAt(0)}
                            </Avatar>
                            <Box className="flex-1 min-w-0">
                              <Typography className="font-semibold text-grey-900 dark:text-white truncate">
                                {connection.user.name}
                              </Typography>
                              <Typography className="text-sm text-grey-500 truncate">
                                {connection.user.profile?.headline || "Professional"}
                              </Typography>
                              {connection.user.profile?.location?.city && (
                                <Typography className="text-xs text-grey-400 flex items-center gap-1 mt-1">
                                  <LocationOn fontSize="inherit" />
                                  {connection.user.profile.location.city}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="small"
                              fullWidth
                              onClick={() => router.push(`/profile/${connection.user._id}`)}
                            >
                              View Profile
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleRemove(connection.user._id)}
                              className="text-grey-500 hover:text-error-600"
                            >
                              <PersonRemove fontSize="small" />
                            </IconButton>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Pending Requests Tab */}
            {activeTab === 1 && (
              <Box className="p-4">
                {loading ? (
                  <Box className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={80} />
                    ))}
                  </Box>
                ) : pendingRequests.length === 0 ? (
                  <Box className="text-center py-12">
                    <Send className="text-grey-300 text-6xl mb-4" />
                    <Typography variant="h6" className="text-grey-600 mb-2">
                      No pending requests
                    </Typography>
                    <Typography className="text-grey-500">
                      When someone sends you a connection request, it will appear here
                    </Typography>
                  </Box>
                ) : (
                  <Box className="space-y-3">
                    {pendingRequests.map((request) => (
                      <Card key={request._id} className="p-4">
                        <Box className="flex items-center gap-4">
                          <Avatar
                            src={request.requester.avatar}
                            className="w-14 h-14 bg-primary-100 text-primary-600"
                          >
                            {request.requester.name.charAt(0)}
                          </Avatar>
                          <Box className="flex-1 min-w-0">
                            <Typography className="font-semibold text-grey-900 dark:text-white">
                              {request.requester.name}
                            </Typography>
                            <Typography className="text-sm text-grey-500 truncate">
                              {request.requester.profile?.headline || "Professional"}
                            </Typography>
                            {request.message && (
                              <Typography className="text-sm text-grey-600 mt-1 italic">
                                "{request.message}"
                              </Typography>
                            )}
                          </Box>
                          <Box className="flex gap-2">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleAccept(request._id)}
                              isLoading={actionLoading === request._id}
                              leftIcon={<Check />}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleReject(request._id)}
                              isLoading={actionLoading === request._id}
                            >
                              <Close />
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Sent Requests Tab */}
            {activeTab === 2 && (
              <Box className="p-4">
                {loading ? (
                  <Box className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={80} />
                    ))}
                  </Box>
                ) : sentRequests.length === 0 ? (
                  <Box className="text-center py-12">
                    <Send className="text-grey-300 text-6xl mb-4" />
                    <Typography variant="h6" className="text-grey-600 mb-2">
                      No sent requests
                    </Typography>
                    <Typography className="text-grey-500">
                      Connection requests you send will appear here
                    </Typography>
                  </Box>
                ) : (
                  <Box className="space-y-3">
                    {sentRequests.map((request) => (
                      <Card key={request._id} className="p-4">
                        <Box className="flex items-center gap-4">
                          <Avatar
                            src={request.recipient.avatar}
                            className="w-14 h-14 bg-primary-100 text-primary-600"
                          >
                            {request.recipient.name.charAt(0)}
                          </Avatar>
                          <Box className="flex-1 min-w-0">
                            <Typography className="font-semibold text-grey-900 dark:text-white">
                              {request.recipient.name}
                            </Typography>
                            <Typography className="text-sm text-grey-500">
                              Request sent
                            </Typography>
                          </Box>
                          <Chip label="Pending" size="small" className="bg-yellow-100 text-yellow-700" />
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Suggestions Tab */}
            {activeTab === 3 && (
              <Box className="p-4">
                {loading ? (
                  <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        <Skeleton variant="rounded" height={180} />
                      </Grid>
                    ))}
                  </Grid>
                ) : suggestions.length === 0 ? (
                  <Box className="text-center py-12">
                    <People className="text-grey-300 text-6xl mb-4" />
                    <Typography variant="h6" className="text-grey-600 mb-2">
                      No suggestions available
                    </Typography>
                    <Typography className="text-grey-500">
                      Complete your profile to get personalized suggestions
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {suggestions.map((suggestion) => (
                      <Grid item xs={12} sm={6} md={4} key={suggestion._id}>
                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <Box className="text-center">
                            <Avatar
                              src={suggestion.avatar}
                              className="w-16 h-16 mx-auto mb-3 bg-primary-100 text-primary-600"
                            >
                              {suggestion.name.charAt(0)}
                            </Avatar>
                            <Typography className="font-semibold text-grey-900 dark:text-white">
                              {suggestion.name}
                            </Typography>
                            <Typography className="text-sm text-grey-500 mb-2">
                              {suggestion.profile?.headline || "Professional"}
                            </Typography>
                            {suggestion.mutualConnectionsCount > 0 && (
                              <Typography className="text-xs text-primary-600 mb-3">
                                {suggestion.mutualConnectionsCount} mutual connection
                                {suggestion.mutualConnectionsCount > 1 ? "s" : ""}
                              </Typography>
                            )}
                            {suggestion.profile?.skills && suggestion.profile.skills.length > 0 && (
                              <Box className="flex flex-wrap justify-center gap-1 mb-3">
                                {suggestion.profile.skills.slice(0, 3).map((skill, idx) => (
                                  <Chip
                                    key={idx}
                                    label={skill.name}
                                    size="small"
                                    variant="outlined"
                                    className="text-xs"
                                  />
                                ))}
                              </Box>
                            )}
                            <Button
                              variant="primary"
                              size="small"
                              fullWidth
                              onClick={() => handleConnect(suggestion._id)}
                              isLoading={actionLoading === suggestion._id}
                              leftIcon={<PersonAdd />}
                            >
                              Connect
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Card>
        </Container>
      </main>

      <Footer />
    </>
  );
}
