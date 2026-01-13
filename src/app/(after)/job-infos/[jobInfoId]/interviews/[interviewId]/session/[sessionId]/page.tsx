"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Pause,
  Send,
  MessageSquare,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SessionDetailResponse,
  CompleteInterviewResponse,
  ConversationMessage,
} from "@/data/type/session";

export default function AIInterviewSessionPage({
  params,
}: {
  params: Promise<{
    jobInfoId: string;
    interviewId: string;
    sessionId: string;
  }>;
}) {
  const router = useRouter();
  const { jobInfoId } = use(params);
  const { interviewId } = use(params);
  const { sessionId } = use(params);
  const jobId = jobInfoId;


  const [session, setSession] = useState<SessionDetailResponse>();
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [interviewState, setInterviewState] = useState<
    "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED" | "PAUSED"
  >("NOT_STARTED");
  const [results, setResults] = useState<CompleteInterviewResponse>();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");

  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const interviewStateRef = useRef(interviewState);

  // Keep interviewState ref in sync
  useEffect(() => {
    interviewStateRef.current = interviewState;
  }, [interviewState]);

  useEffect(() => {
    initializeSession();
    initializeSpeechRecognition();
    startStatusPolling();
    startCountdown();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      stopSpeaking();
    };
  }, []);

  // Start/stop countdown based on interview state
  useEffect(() => {
    if (interviewState === "IN_PROGRESS" && timeRemaining > 0) {
      startCountdown();
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [interviewState, timeRemaining]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSession = async () => {
    try {
      const response = await fetch(
        `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      setSession(data);

      // Set interview state based on actual session status
      if (data.status === "COMPLETED") {
        setInterviewState("COMPLETED");
        loadResults();
      } else if (data.status === "NOT_STARTED") {
        setInterviewState("NOT_STARTED");
      } else if (data.status === "PAUSED") {
        setInterviewState("PAUSED");
      } else {
        setInterviewState("IN_PROGRESS");
      }

      if (data.conversationHistory) {
        const history = JSON.parse(data.conversationHistory);
        const filtered = history.filter(
          (msg: ConversationMessage) => msg.role !== "system"
        );
        setConversation(filtered);

        // Only speak if interview is in progress (not when just starting)
        if (data.status === "IN_PROGRESS" && filtered.length > 0) {
          const lastAI = filtered
            .filter((m: ConversationMessage) => m.role === "assistant")
            .pop();
          if (lastAI) {
            speakText(lastAI.content);
          }
        }
      }

      // Fetch initial status to get time remaining and question number
      if (data.status === "IN_PROGRESS" || data.status === "PAUSED") {
        try {
          const statusResponse = await fetch(
            `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/status`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const status = await statusResponse.json();
          if (status.currentQuestion !== undefined) {
            setQuestionNumber(status.currentQuestion);
          }
          const backendTime = status.timeRemaining ?? 0;
          setTimeRemaining(backendTime);
          // Restart countdown if interview is in progress
          if (data.status === "IN_PROGRESS" && backendTime > 0) {
            setTimeout(() => startCountdown(), 100);
          }
        } catch (statusError) {
          console.error("Failed to fetch initial status:", statusError);
          setTimeRemaining(0);
        }
      } else {
        setTimeRemaining(0);
      }
    } catch (error) {
      console.error("Failed to initialize session:", error);
    }
  };

  const loadResults = async () => {
    try {
      const response = await fetch(
        `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        }
      );

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to load results:", error);
    }
  };

  const startCountdown = () => {
    // Clear any existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Only start countdown if interview is in progress
    // Note: Countdown will continue even when time reaches 0 - backend manages completion
    if (interviewStateRef.current !== "IN_PROGRESS") {
      return;
    }

    countdownIntervalRef.current = window.setInterval(() => {
      // Check current state using ref
      if (interviewStateRef.current !== "IN_PROGRESS") {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        return;
      }

      setTimeRemaining((prevTime) => {
        // Don't stop countdown when time reaches 0 - let backend manage completion
        // Just keep it at 0 and let user continue interacting
        if (prevTime <= 0) {
          return 0;
        }
        // Decrease by 1 second (timeRemaining is in minutes, so subtract 1/60)
        const newTime = Math.max(0, prevTime - (1 / 60));
        
        return newTime;
      });
    }, 1000); // Update every second
  };

  const startStatusPolling = () => {
    pollIntervalRef.current = window.setInterval(async () => {
      // Only poll if interview is in progress (not paused or not started)
      if (interviewStateRef.current !== "IN_PROGRESS") {
        return;
      }
      
      try {
        const response = await fetch(
          `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/status`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const status = await response.json();
        console.log("Polled status:", status);
        
        // Update time from backend (this syncs with server time)
        const backendTime = status.timeRemaining ?? 0;
        setTimeRemaining(backendTime);
        
        // Restart countdown if interview is in progress (even if time is 0, backend manages completion)
        if (interviewStateRef.current === "IN_PROGRESS") {
          startCountdown();
        }
        
        if (status.currentQuestion !== undefined) {
          setQuestionNumber(status.currentQuestion);
        }

        // Check if backend has marked session as completed
        if (status.status === "COMPLETED") {
          setInterviewState("COMPLETED");
          if (pollIntervalRef.current !== null) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          loadResults();
        }
      } catch (error) {
        console.error("Failed to poll status:", error);
      }
    }, 30000); // Poll backend every 30 seconds for accuracy
  };

  const initializeSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);

      if (event.results[current].isFinal) {
        handleSendMessage(transcriptText);
        setTranscript("");
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition not supported in this browser. Please use text input instead."
      );
      setInputMode("text");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start recognition:", error);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    stopSpeaking();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || interviewState === "NOT_STARTED" || interviewState === "PAUSED") return;

    setLoading(true);
    setConversation((prev) => [...prev, { role: "user", content: message }]);
    setTextInput("");

    try {
      const response = await fetch(
        `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId, message }),
        }
      );

      const data = await response.json();
      
      // Update conversation with AI response
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: data.aiResponse },
      ]);

      // Update question number if provided in response
      if (data.currentQuestion) {
        setQuestionNumber(data.currentQuestion);
      }

      if (inputMode === "voice") {
        speakText(data.aiResponse);
      }

      // Backend will manage completion based on time and session state
      // Check if backend marked session as completed after this message
      if (data.status === "COMPLETED") {
        // Backend has marked the session as completed
        setInterviewState("COMPLETED");
        loadResults();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleSendMessage(textInput);
    }
  };

  const handleStartInterview = async () => {
    stopSpeaking();
    if (recognitionRef.current) recognitionRef.current.stop();

    setLoading(true);
    try {
      const response = await fetch(
        `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        }
      );
      
      const data = await response.json();
      
      // Update interview state
      setInterviewState("IN_PROGRESS");
      
      // Refresh session data to get updated status, conversation, and question number
      const sessionResponse = await fetch(
        `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}`,
        {
          headers: { 
            "Content-Type": "application/json",
          }
        }
      );
      const sessionData = await sessionResponse.json();
      setSession(sessionData);
      
      // Update conversation from session data
      if (sessionData.conversationHistory) {
        const history = JSON.parse(sessionData.conversationHistory);
        const filtered = history.filter(
          (msg: ConversationMessage) => msg.role !== "system"
        );
        setConversation(filtered);
        
        // Speak the last AI message if in voice mode
        if (inputMode === "voice" && filtered.length > 0) {
          const lastAI = filtered
            .filter((m: ConversationMessage) => m.role === "assistant")
            .pop();
          if (lastAI) {
            speakText(lastAI.content);
          }
        }
      }
      
      // Fetch status to get accurate question number and time remaining
      try {
        const statusResponse = await fetch(
          `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/status`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const status = await statusResponse.json();
        if (status.currentQuestion !== undefined) {
          setQuestionNumber(status.currentQuestion);
        }
        const backendTime = status.timeRemaining ?? 0;
        setTimeRemaining(backendTime);
        // Start countdown after setting time
        if (backendTime > 0) {
          setTimeout(() => startCountdown(), 100);
        }
      } catch (statusError) {
        console.error("Failed to fetch status after start:", statusError);
        // Set defaults if status fetch fails
        if (data.currentQuestion !== undefined) {
          setQuestionNumber(data.currentQuestion);
        }
        setTimeRemaining(0);
      }
    } catch (error) {
      console.error("Failed to start:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handlePauseInterview = async () => {
    stopSpeaking();
    if (recognitionRef.current) recognitionRef.current.stop();

    try {
      await fetch(`/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/pause`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });
      router.push(`/job-infos/${jobInfoId}/interviews/${interviewId}`);
    } catch (error) {
      console.error("Failed to pause:", error);
    }
  };

  const handleCompleteInterview = async () => {
    stopSpeaking();
    if (recognitionRef.current) recognitionRef.current.stop();
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    setLoading(true);

    try {
      const response = await fetch(
        `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        }
      );

      const data = await response.json();
      setResults(data);
      setInterviewState("COMPLETED");
    } catch (error) {
      console.error("Failed to complete:", error);
      alert("Failed to complete interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeInterview = async () => {
    stopSpeaking();
    if (recognitionRef.current) recognitionRef.current.stop();

    setLoading(true);
    try {
      const response = await fetch(
        `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resume interview");
      }

      const data = await response.json();
      
      // Update interview state to IN_PROGRESS
      setInterviewState("IN_PROGRESS");
      
      // Refresh session data
      const sessionResponse = await fetch(
        `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}`,
        {
          headers: { 
            "Content-Type": "application/json",
          }
        }
      );
      const sessionData = await sessionResponse.json();
      setSession(sessionData);
      
      // Update conversation from session data
      if (sessionData.conversationHistory) {
        const history = JSON.parse(sessionData.conversationHistory);
        const filtered = history.filter(
          (msg: ConversationMessage) => msg.role !== "system"
        );
        setConversation(filtered);
      }
      
      // Update question number and time remaining from response if available
      if (data.currentQuestion !== undefined) {
        setQuestionNumber(data.currentQuestion);
      }
      if (data.timeRemaining !== undefined && data.timeRemaining !== null) {
        setTimeRemaining(data.timeRemaining);
      } else {
        setTimeRemaining(0);
      }

      // Fetch latest status to get accurate question number and time
      try {
        const statusResponse = await fetch(
          `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/status`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const status = await statusResponse.json();
        if (status.currentQuestion !== undefined) {
          setQuestionNumber(status.currentQuestion);
        }
        const backendTime = status.timeRemaining !== undefined && status.timeRemaining !== null 
          ? status.timeRemaining 
          : 0;
        setTimeRemaining(backendTime);
        // Restart countdown if we have time
        if (backendTime > 0) {
          setTimeout(() => startCountdown(), 100);
        }
      } catch (statusError) {
        console.error("Failed to fetch status after resume:", statusError);
        // Non-critical, continue anyway
      }
    } catch (error) {
      console.error("Failed to resume interview:", error);
      alert("Failed to resume interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeAgain = () => {
    router.push(`/interviews/${jobId}/new`);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // COMPLETED STATE - Results View
  if (interviewState === "COMPLETED" && results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push(`/job-infos/${jobInfoId}/interviews/${interviewId}`)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sessions
            </Button>
            <h1 className="text-3xl font-bold">Interview Completed! 🎉</h1>
            <p className="text-muted-foreground mt-2">{session.jobTitle}</p>
          </div>

          <Card className="mb-6 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Overall Performance</span>
                <Badge className="text-2xl px-4 py-2">
                  {Math.round(results.overallScore || 0)}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ScoreItem
                  label="Technical"
                  score={results.technicalScore ? results.technicalScore : 0}
                />
                <ScoreItem
                  label="Communication"
                  score={
                    results.communicationScore ? results.communicationScore : 0
                  }
                />
                <ScoreItem
                  label="Confidence"
                  score={results.confidenceScore ? results.confidenceScore : 0}
                />
                <ScoreItem
                  label="Problem Solving"
                  score={
                    results.problemSolvingScore
                      ? results.problemSolvingScore
                      : 0
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Feedback Sections */}
          <div className="space-y-4 mb-6">
            {results.strengths && (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">
                    💪 Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {results.strengths}
                  </p>
                </CardContent>
              </Card>
            )}

            {results.weaknesses && (
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-700">
                    📈 Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {results.weaknesses}
                  </p>
                </CardContent>
              </Card>
            )}

            {results.recommendations && (
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">
                    💡 Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {results.recommendations}
                  </p>
                </CardContent>
              </Card>
            )}

            {results.feedback && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {results.feedback}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Conversation Toggle */}
          <Card className="mb-6">
            <CardHeader>
              <Button
                variant="ghost"
                onClick={() => setShowConversation(!showConversation)}
                className="w-full justify-between"
              >
                <span className="font-semibold">
                  View Full Conversation ({results.totalQuestions} questions)
                </span>
                {showConversation ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CardHeader>
            {showConversation && (
              <CardContent className="max-h-[500px] overflow-y-auto space-y-4">
                {conversation?.map((msg: ConversationMessage, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {msg.role === "user" ? "You" : "AI Interviewer"}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/interviews/${jobId}`)}
              className="flex-1"
            >
              Back to Sessions
            </Button>
            <Button onClick={handlePracticeAgain} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Practice Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // IN_PROGRESS STATE - Interview View
  const timePercentage =
    session != null
      ? session.durationMinutes
        ? 0 > 0
          ? ((session.durationMinutes - timeRemaining) /
              session.durationMinutes) *
            100
          : 0
        : 0
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">{session.jobTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {interviewState === "NOT_STARTED" 
                  ? "Interview not started"
                  : interviewState === "PAUSED"
                  ? "Interview paused"
                  : `Question ${questionNumber || 1}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p className="text-lg font-semibold">{timeRemaining.toFixed(0)} min</p>
              </div>

              {interviewState === "NOT_STARTED" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStartInterview}
                  disabled={loading}
                >
                  Start
                </Button>
              ) : interviewState === "PAUSED" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResumeInterview}
                  disabled={loading}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePauseInterview}
                    disabled={loading}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCompleteInterview}
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    End
                  </Button>
                </>
              )}
            </div>
          </div>

          <Progress value={timePercentage} className="mt-3 h-1" />
        </div>
      </div>

      {/* Conversation */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="min-h-[55vh] max-h-[55vh] overflow-hidden flex flex-col mb-6">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {interviewState === "NOT_STARTED" && conversation.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">
                  Click "Start" to begin the interview
                </p>
              </div>
            )}
            {interviewState === "PAUSED" && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Pause className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground text-lg">
                    Interview is paused
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click "Resume" to continue the interview
                  </p>
                </div>
              </div>
            )}
            {conversation?.map((msg: ConversationMessage, idx: number) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {msg.role === "user" ? "You" : "AI Interviewer"}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex gap-2">
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={conversationEndRef} />
          </CardContent>
        </Card>

        {/* Input Mode Tabs */}
        <Tabs
          value={inputMode}
          onValueChange={(value) => setInputMode(value as "voice" | "text")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="w-4 h-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Text
            </TabsTrigger>
          </TabsList>

          {/* Voice Input */}
          <TabsContent value="voice" className="space-y-4">
            {transcript && (
              <Card className="border-yellow-300 bg-yellow-50">
                <CardContent className="p-3">
                  <p className="text-sm text-yellow-900">
                    <strong>Listening:</strong> {transcript}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={toggleListening}
                disabled={isSpeaking || loading || interviewState === "NOT_STARTED" || interviewState === "PAUSED"}
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className="h-16 w-16 rounded-full"
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>

              <div className="flex gap-3">
                {isSpeaking && (
                  <Badge variant="secondary">
                    <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                    AI is speaking...
                  </Badge>
                )}

                {isListening && (
                  <Badge className="bg-red-500">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Listening...
                  </Badge>
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {isListening
                  ? "Speak your answer"
                  : isSpeaking
                  ? "AI is speaking"
                  : "Click microphone to answer"}
              </p>
            </div>
          </TabsContent>

          {/* Text Input */}
          <TabsContent value="text" className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleTextSubmit();
                  }
                }}
                placeholder={
                  interviewState === "NOT_STARTED"
                    ? "Click 'Start' to begin the interview"
                    : interviewState === "PAUSED"
                    ? "Interview is paused. Click 'Resume' to continue"
                    : "Type your answer here... (Press Enter to send, Shift+Enter for new line)"
                }
                className="min-h-[100px]"
                disabled={loading || interviewState === "NOT_STARTED" || interviewState === "PAUSED"}
              />
              <Button
                onClick={handleTextSubmit}
                disabled={loading || !textInput.trim() || interviewState === "NOT_STARTED" || interviewState === "PAUSED"}
                size="lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ScoreItem({ label, score }: { label: string; score?: number }) {
  const percentage = Math.round(score || 0);
  const getColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${getColor(percentage)}`}>
        {percentage}
      </p>
    </div>
  );
}
