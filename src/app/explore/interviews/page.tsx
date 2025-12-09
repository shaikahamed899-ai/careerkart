"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { interviewsApi, InterviewSession, InterviewBotConfig, AnswerResponse } from "@/lib/api/interviews";
import {
  Container,
  Typography,
  Grid,
  Avatar,
  Skeleton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  QuestionAnswer,
  Psychology,
  Code,
  Person,
  PlayArrow,
  Send,
  History,
  Star,
  TrendingUp,
  CheckCircle,
  Close,
} from "@mui/icons-material";

const interviewTypes = [
  {
    type: "technical" as const,
    title: "Technical Interview",
    description: "Practice coding and technical questions",
    icon: <Code className="text-primary-600 text-3xl" />,
    color: "bg-primary-50 dark:bg-primary-900/20",
  },
  {
    type: "behavioral" as const,
    title: "Behavioral Interview",
    description: "Practice STAR method and soft skills",
    icon: <Person className="text-accent-600 text-3xl" />,
    color: "bg-accent-50 dark:bg-accent-900/20",
  },
  {
    type: "hr" as const,
    title: "HR Interview",
    description: "Practice common HR questions",
    icon: <Psychology className="text-success-600 text-3xl" />,
    color: "bg-success-50 dark:bg-success-900/20",
  },
  {
    type: "mixed" as const,
    title: "Mixed Interview",
    description: "Combination of all interview types",
    icon: <QuestionAnswer className="text-warning-600 text-3xl" />,
    color: "bg-warning-50 dark:bg-warning-900/20",
  },
];

export default function ExploreInterviewsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { showSnackbar, openSignIn } = useUIStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"technical" | "behavioral" | "hr" | "mixed">("technical");
  const [config, setConfig] = useState<InterviewBotConfig>({
    jobRole: "",
    company: "",
    difficulty: "medium",
    questionCount: 5,
  });

  // Active session state
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{ number: number; content: string } | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 5 });

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.conversation]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await interviewsApi.getHistory(1, 10);
      setHistory(response.data || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = (type: "technical" | "behavioral" | "hr" | "mixed") => {
    if (!isAuthenticated) {
      showSnackbar("Please login to start an interview", "info");
      return;
    }
    setSelectedType(type);
    setConfigDialogOpen(true);
  };

  const startSession = async () => {
    setConfigDialogOpen(false);
    setLoading(true);

    try {
      const response = await interviewsApi.startSession(selectedType, config);
      if (response.success && response.data) {
        setActiveSession({
          _id: response.data.sessionId,
          type: response.data.type as InterviewSession["type"],
          config: response.data.config,
          status: "in_progress",
          conversation: [
            {
              role: "assistant",
              content: response.data.currentQuestion.content,
              questionNumber: response.data.currentQuestion.number,
            },
          ],
          startedAt: new Date().toISOString(),
        });
        setCurrentQuestion(response.data.currentQuestion);
        setProgress({ current: 1, total: config.questionCount || 5 });
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to start interview", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!activeSession || !answer.trim()) return;

    setSubmitting(true);
    try {
      const response = await interviewsApi.submitAnswer(activeSession._id, answer);
      if (response.success && response.data) {
        const data = response.data;

        // Update conversation
        setActiveSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            conversation: [
              ...prev.conversation,
              { role: "user", content: answer },
              ...(data.feedback
                ? [
                    {
                      role: "assistant" as const,
                      content: `**Feedback (Score: ${data.feedback.score}/10)**\n\n**Strengths:** ${data.feedback.strengths.join(", ") || "N/A"}\n\n**Areas to improve:** ${data.feedback.improvements.join(", ") || "N/A"}\n\n${data.feedback.suggestion}`,
                    },
                  ]
                : []),
              ...(data.nextQuestion
                ? [
                    {
                      role: "assistant" as const,
                      content: data.nextQuestion.content,
                      questionNumber: data.nextQuestion.number,
                    },
                  ]
                : []),
            ],
            results: data.results,
            status: data.isComplete ? "completed" : "in_progress",
          };
        });

        if (data.progress) {
          setProgress(data.progress);
        }

        if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
        }

        setAnswer("");

        if (data.isComplete) {
          showSnackbar("Interview completed! Check your results.", "success");
          fetchHistory();
        }
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to submit answer", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    try {
      await interviewsApi.endSession(activeSession._id);
      setActiveSession(null);
      setCurrentQuestion(null);
      fetchHistory();
      showSnackbar("Interview ended", "info");
    } catch (error: any) {
      showSnackbar(error.message || "Failed to end interview", "error");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success-600";
    if (score >= 60) return "text-warning-600";
    return "text-error-600";
  };

  // Active Interview View
  if (activeSession) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
          <Container maxWidth="lg" className="py-6">
            {/* Header */}
            <Box className="flex items-center justify-between mb-4">
              <Box>
                <Typography variant="h5" className="font-bold text-grey-900 dark:text-white">
                  {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Interview
                </Typography>
                <Typography className="text-grey-500">
                  Question {progress.current} of {progress.total}
                </Typography>
              </Box>
              <Button variant="outline" onClick={endSession} leftIcon={<Close />}>
                End Interview
              </Button>
            </Box>

            {/* Progress */}
            <LinearProgress
              variant="determinate"
              value={(progress.current / progress.total) * 100}
              className="mb-6 h-2 rounded-full"
            />

            {/* Chat Area */}
            <Card className="p-0 mb-4 max-h-[500px] overflow-y-auto">
              <Box className="p-4 space-y-4">
                {activeSession.conversation.map((msg, idx) => (
                  <Box
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <Box
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-primary-600 text-white"
                          : "bg-grey-100 dark:bg-grey-800 text-grey-900 dark:text-white"
                      }`}
                    >
                      {msg.questionNumber && (
                        <Chip
                          label={`Question ${msg.questionNumber}`}
                          size="small"
                          className="mb-2 bg-primary-100 text-primary-700"
                        />
                      )}
                      <Typography className="whitespace-pre-wrap">{msg.content}</Typography>
                    </Box>
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </Box>
            </Card>

            {/* Results */}
            {activeSession.status === "completed" && activeSession.results && (
              <Card className="p-6 mb-4">
                <Typography variant="h6" className="font-bold text-grey-900 dark:text-white mb-4">
                  Interview Results
                </Typography>
                <Box className="text-center mb-6">
                  <Typography variant="h2" className={`font-bold ${getScoreColor(activeSession.results.overallScore)}`}>
                    {activeSession.results.overallScore}%
                  </Typography>
                  <Typography className="text-grey-500">Overall Score</Typography>
                </Box>
                <Grid container spacing={3} className="mb-6">
                  {Object.entries(activeSession.results.categoryScores).map(([key, value]) => (
                    <Grid item xs={6} sm={3} key={key}>
                      <Box className="text-center p-3 bg-grey-50 dark:bg-grey-800 rounded-xl">
                        <Typography variant="h5" className="font-bold text-grey-900 dark:text-white">
                          {value}%
                        </Typography>
                        <Typography className="text-xs text-grey-500 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Box className="space-y-4">
                  <Box>
                    <Typography className="font-semibold text-success-600 mb-2">Strengths</Typography>
                    <Box className="flex flex-wrap gap-2">
                      {activeSession.results.strengths.map((s, i) => (
                        <Chip key={i} label={s} size="small" className="bg-success-100 text-success-700" />
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Typography className="font-semibold text-warning-600 mb-2">Areas to Improve</Typography>
                    <Box className="flex flex-wrap gap-2">
                      {activeSession.results.areasToImprove.map((s, i) => (
                        <Chip key={i} label={s} size="small" className="bg-warning-100 text-warning-700" />
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant="primary"
                  className="mt-6"
                  onClick={() => {
                    setActiveSession(null);
                    setCurrentQuestion(null);
                  }}
                >
                  Back to Interviews
                </Button>
              </Card>
            )}

            {/* Answer Input */}
            {activeSession.status === "in_progress" && (
              <Card className="p-4">
                <Box className="flex gap-3">
                  <TextField
                    placeholder="Type your answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitAnswer();
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    onClick={submitAnswer}
                    isLoading={submitting}
                    disabled={!answer.trim()}
                    className="self-end"
                  >
                    <Send />
                  </Button>
                </Box>
              </Card>
            )}
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-grey-50 dark:bg-grey-950">
        <Container maxWidth="lg" className="py-10">
          <Typography
            variant="h4"
            className="font-semibold mb-2 text-grey-900 dark:text-white"
          >
            AI Mock Interviews
          </Typography>
          <Typography className="text-grey-600 dark:text-grey-400 mb-8">
            Practice with our AI interviewer and get instant feedback
          </Typography>

          {/* Interview Types */}
          <Grid container spacing={3} className="mb-8">
            {interviewTypes.map((interview) => (
              <Grid item xs={12} sm={6} md={3} key={interview.type}>
                <Card
                  className="p-5 h-full cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => handleStartInterview(interview.type)}
                >
                  <Box className={`w-14 h-14 rounded-xl ${interview.color} flex items-center justify-center mb-4`}>
                    {interview.icon}
                  </Box>
                  <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white mb-2">
                    {interview.title}
                  </Typography>
                  <Typography className="text-sm text-grey-600 dark:text-grey-400 mb-4">
                    {interview.description}
                  </Typography>
                  <Box className="flex items-center text-primary-600 font-medium">
                    <PlayArrow fontSize="small" className="mr-1" />
                    Start Practice
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Interview History */}
          <Card className="p-5">
            <Box className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="font-semibold text-grey-900 dark:text-white">
                <History className="mr-2 text-grey-500" />
                Recent Practice Sessions
              </Typography>
            </Box>

            {loading ? (
              <Box className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={80} />
                ))}
              </Box>
            ) : !isAuthenticated ? (
              <Box className="text-center py-8">
                <QuestionAnswer className="text-grey-300 text-5xl mb-3" />
                <Typography className="text-grey-500 mb-4">
                  Login to track your interview practice history
                </Typography>
                <Button variant="primary" onClick={openSignIn}>
                  Login
                </Button>
              </Box>
            ) : history.length === 0 ? (
              <Box className="text-center py-8">
                <QuestionAnswer className="text-grey-300 text-5xl mb-3" />
                <Typography className="text-grey-500">
                  No practice sessions yet. Start your first interview!
                </Typography>
              </Box>
            ) : (
              <Box className="space-y-3">
                {history.map((session) => (
                  <Box
                    key={session._id}
                    className="flex items-center justify-between p-4 bg-grey-50 dark:bg-grey-800 rounded-xl"
                  >
                    <Box className="flex items-center gap-4">
                      <Box
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          interviewTypes.find((t) => t.type === session.type)?.color || "bg-grey-100"
                        }`}
                      >
                        {interviewTypes.find((t) => t.type === session.type)?.icon}
                      </Box>
                      <Box>
                        <Typography className="font-semibold text-grey-900 dark:text-white capitalize">
                          {session.type} Interview
                        </Typography>
                        <Typography className="text-sm text-grey-500">
                          {session.config.jobRole || "General"} • {new Date(session.startedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box className="flex items-center gap-4">
                      {session.results && (
                        <Box className="text-right">
                          <Typography className={`font-bold text-lg ${getScoreColor(session.results.overallScore)}`}>
                            {session.results.overallScore}%
                          </Typography>
                          <Typography className="text-xs text-grey-500">Score</Typography>
                        </Box>
                      )}
                      <Chip
                        label={session.status}
                        size="small"
                        className={
                          session.status === "completed"
                            ? "bg-success-100 text-success-700"
                            : session.status === "in_progress"
                            ? "bg-warning-100 text-warning-700"
                            : "bg-grey-100 text-grey-700"
                        }
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Container>
      </main>

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure Your Interview</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              label="Target Job Role"
              placeholder="e.g., Software Engineer"
              value={config.jobRole}
              onChange={(e) => setConfig({ ...config, jobRole: e.target.value })}
              fullWidth
            />
            <TextField
              label="Target Company (Optional)"
              placeholder="e.g., Google"
              value={config.company}
              onChange={(e) => setConfig({ ...config, company: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={config.difficulty}
                label="Difficulty"
                onChange={(e) => setConfig({ ...config, difficulty: e.target.value as InterviewBotConfig["difficulty"] })}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Number of Questions</InputLabel>
              <Select
                value={config.questionCount}
                label="Number of Questions"
                onChange={(e) => setConfig({ ...config, questionCount: Number(e.target.value) })}
              >
                <MenuItem value={3}>3 Questions</MenuItem>
                <MenuItem value={5}>5 Questions</MenuItem>
                <MenuItem value={10}>10 Questions</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={startSession} leftIcon={<PlayArrow />}>
            Start Interview
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}
