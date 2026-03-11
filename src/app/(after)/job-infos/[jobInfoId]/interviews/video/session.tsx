"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Pause,
  Send,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Bot,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SessionDetailResponse,
  CompleteInterviewResponse,
  ConversationMessage,
} from "@/data/type/session";

export type VideoSessionParams = {
  jobInfoId: string;
  interviewId: string;
  sessionId: string;
};

export default function AIInterviewSessionPage({
  params,
  videoRoute = false,
}: {
  params: Promise<VideoSessionParams>;
  videoRoute?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { jobInfoId, interviewId, sessionId } = use(params);
  const jobId = jobInfoId;
  const isVideoMode = videoRoute || searchParams.get("video") === "1";
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);


  const [session, setSession] = useState<SessionDetailResponse>();
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [interviewState, setInterviewState] = useState<"IN_PROGRESS" | "COMPLETED" | "NOT_STARTED" | "PAUSED">("NOT_STARTED");
  const [results, setResults] = useState<CompleteInterviewResponse>();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const interviewStateRef = useRef(interviewState);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const transcriptSentRef = useRef(false);

  const sendTranscript = () => {
    if (transcriptSentRef.current) return;
  
    // Only use final — interim is unreliable at onend time
    const toSend = finalTranscriptRef.current.trim();
  
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setTranscript("");
  
    if (!toSend) return;
  
    transcriptSentRef.current = true;
    handleSendMessage(toSend);
  };

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

  useEffect(() => {
    if (!isVideoMode) return;
    if (interviewState === "COMPLETED") {
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
      return;
    }
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoStreamRef.current = stream;
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
      } catch (e) {
        console.error("Camera access failed:", e);
      }
    };
    startVideo();
    return () => {
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
    };
  }, [isVideoMode, interviewState]);

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

        if (data.status === "IN_PROGRESS" && filtered.length > 0) {
          const lastAI = filtered
            .filter((m: ConversationMessage) => m.role === "assistant")
            .pop();
          if (lastAI) {
            speakText(lastAI.content);
          }
        }
      }

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
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";
  
    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += text + " ";
          interimTranscriptRef.current = "";
        } else {
          interimTranscript += text;
        }
      }

      interimTranscriptRef.current = interimTranscript;
      setTranscript((finalTranscriptRef.current + interimTranscriptRef.current).trim());
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      sendTranscript();
    };
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
  
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);

      // In some browsers, onend may not fire reliably, so also attempt to send
      // the current transcript after a short delay.
      setTimeout(sendTranscript, 300);
    } else {
      stopSpeaking();
      finalTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      transcriptSentRef.current = false;
      setTranscript("");
  
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
    if (!message.trim() || interviewState === "NOT_STARTED" || interviewState === "PAUSED") {
      setInterviewState("IN_PROGRESS");
    }

    setLoading(true);
    setConversation((prev) => [...prev, { role: "user", content: message }]);

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
      if (!response.ok) {
        return alert("response is not ok try again later /message")
      }
      // Update conversation with AI response
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: data.aiResponse },
      ]);

      // Update question number if provided in response
      if (data.currentQuestion) {
        setQuestionNumber(data.currentQuestion);
      }

      speakText(data.aiResponse);

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
      if (!response.ok){
        return alert("response is not ok try again later")
      }
      
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
        
        const lastAI = filtered
          .filter((m: ConversationMessage) => m.role === "assistant")
          .pop();
        if (lastAI) {
          speakText(lastAI.content);
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
      router.push(videoRoute ? `/job-infos/${jobInfoId}/interviews/video` : `/job-infos/${jobInfoId}/interviews/${interviewId}`);
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
      setInterviewState("IN_PROGRESS");
      
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
      
      if (sessionData.conversationHistory) {
        const history = JSON.parse(sessionData.conversationHistory);
        const filtered = history.filter(
          (msg: ConversationMessage) => msg.role !== "system"
        );
        setConversation(filtered);
      }
      
      if (data.currentQuestion !== undefined) {
        setQuestionNumber(data.currentQuestion);
      }
      if (data.timeRemaining !== undefined && data.timeRemaining !== null) {
        setTimeRemaining(data.timeRemaining);
      } else {
        setTimeRemaining(0);
      }

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
        if (backendTime > 0) {
          setTimeout(() => startCountdown(), 100);
        }
      } catch (statusError) {
        console.error("Failed to fetch status after resume:", statusError);
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

  if (interviewState === "COMPLETED" && results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push(videoRoute ? `/job-infos/${jobInfoId}/interviews/video` : `/job-infos/${jobInfoId}/interviews/${interviewId}`)}
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
              onClick={() => router.push(videoRoute ? `/job-infos/${jobInfoId}/interviews/video` : `/job-infos/${jobInfoId}/interviews/${interviewId}`)}
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
    session != null && session.durationMinutes != null && session.durationMinutes > 0
      ? Math.min(100, ((session.durationMinutes - timeRemaining) / session.durationMinutes) * 100)
      : 0;
  const lastAssistantIndex = conversation?.length
    ? conversation.map((m, i) => (m.role === "assistant" ? i : -1)).filter((i) => i >= 0).pop() ?? -1
    : -1;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      {/* Top: Nav only */}
      <header className="shrink-0 border-b border-border/60 bg-background/90 backdrop-blur-md shadow-sm z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(videoRoute ? `/job-infos/${jobInfoId}/interviews/video` : `/job-infos/${jobInfoId}/interviews/${interviewId}`)}
                className="shrink-0 rounded-full"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">{session.jobTitle}</h1>
                <p className="text-xs text-muted-foreground">
                  {interviewState === "NOT_STARTED"
                    ? "Not started"
                    : interviewState === "PAUSED"
                    ? "Paused"
                    : `Q${questionNumber || 1}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5">
                <span className="text-xs text-muted-foreground">Time</span>
                <span className="text-sm font-medium tabular-nums">{timeRemaining.toFixed(0)} m</span>
              </div>
              <div className="h-6 w-px bg-border hidden sm:block" />
              {interviewState === "NOT_STARTED" ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleStartInterview}
                  disabled={loading}
                  className="rounded-full px-4"
                >
                  Start
                </Button>
              ) : interviewState === "PAUSED" ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleResumeInterview}
                  disabled={loading}
                  className="rounded-full px-4 gap-1.5"
                >
                  <PlayCircle className="h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePauseInterview}
                    disabled={loading}
                    className="rounded-full"
                  >
                    <Pause className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Pause</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCompleteInterview}
                    disabled={loading}
                    className="rounded-full"
                  >
                    <X className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">End</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
          <Progress value={timePercentage} className="mt-2 h-1.5 rounded-full" />
        </div>
      </header>

      {/* 50%: AI (left) + Webcam (right) */}
      <section className="shrink-0 h-[50vh] min-h-[200px] container mx-auto px-4 py-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Left: AI avatar + label */}
          <div className="flex flex-col items-center md:items-start justify-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm h-full">
            <div
              className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 ${
                isSpeaking ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background animate-pulse" : ""
              }`}
            >
              <Bot className="h-10 w-10 text-primary" />
              {isSpeaking && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-primary" />
                </span>
              )}
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm font-medium">AI Interviewer</p>
              <p className="text-xs text-muted-foreground">
                {isSpeaking ? "Speaking..." : isListening ? "Your turn" : "Ready"}
              </p>
            </div>
          </div>

          {/* Right: Your webcam */}
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm h-full min-h-0">
            {isVideoMode ? (
              <>
                <div className="relative w-full flex-1 min-h-0 rounded-lg overflow-hidden bg-muted border border-border">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {isListening && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <div className="h-12 w-12 rounded-full bg-red-500/80 flex items-center justify-center animate-pulse">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <User className="h-3.5 w-3.5" />
                  You
                </p>
              </>
            ) : (
              <>
                <div className="w-full flex-1 min-h-0 rounded-lg bg-muted/50 border border-dashed border-border flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <p className="text-xs text-muted-foreground shrink-0">Voice only (no camera)</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Below: Conversation + voice controls */}
      <div className="flex-1 min-h-0 flex flex-col container mx-auto px-4 max-w-5xl pb-4">
        <Card className="flex flex-col flex-1 min-h-0 border-border shadow-sm overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {interviewState === "NOT_STARTED" && conversation.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <p className="text-muted-foreground text-center text-sm">
                  Click &quot;Start&quot; to begin the interview
                </p>
              </div>
            )}
            {interviewState === "PAUSED" && (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center space-y-3">
                  <Pause className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Interview paused</p>
                  <p className="text-xs text-muted-foreground">Click Resume to continue</p>
                </div>
              </div>
            )}
            {conversation?.map((msg: ConversationMessage, idx: number) => {
              const isLastAI = msg.role === "assistant" && idx === lastAssistantIndex;
              const showAISpeaking = isLastAI && isSpeaking;
              const showUserSpeaking = msg.role === "user" && isListening && idx === conversation.length - 1;
              return (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 transition-all ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    } ${
                      showAISpeaking
                        ? "ring-2 ring-primary/30 shadow-lg"
                        : showUserSpeaking
                        ? "ring-2 ring-red-400/40 shadow-lg"
                        : ""
                    }`}
                  >
                    <p className="text-xs font-medium mb-1.5 opacity-90 flex items-center gap-1.5">
                      {msg.role === "user" ? (
                        <>
                          <User className="h-3 w-3" />
                          You
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3" />
                          AI Interviewer
                        </>
                      )}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    {(showAISpeaking || showUserSpeaking) && (
                      <div className="flex gap-1 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={conversationEndRef} />
          </CardContent>
        </Card>

        {/* Voice only: tap mic to speak; when you stop, it auto-sends */}
        <div className="shrink-0 pt-3 space-y-2">
          {transcript && (
            <p className="text-center text-sm text-muted-foreground truncate px-2 max-w-full" title={transcript}>
              Listening: {transcript}
            </p>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleListening}
                disabled={isSpeaking || loading || interviewState === "NOT_STARTED" || interviewState === "PAUSED"}
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className="h-14 w-14 rounded-full"
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>
              <Button
                onClick={() => {
                  if (recognitionRef.current) recognitionRef.current.stop();
                  sendTranscript();
                }}
                disabled={
                  loading ||
                  interviewState === "NOT_STARTED" ||
                  interviewState === "PAUSED" ||
                  !transcript.trim()
                }
                size="icon"
                variant="outline"
                className="h-14 w-14 rounded-full shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {isSpeaking && (
                <Badge variant="secondary" className="gap-1">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  AI speaking
                </Badge>
              )}
              {isListening && (
                <Badge className="bg-red-500 gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Listening — stop to send
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {isListening ? "Speak your answer, then stop to send" : isSpeaking ? "AI is speaking" : "Tap mic to answer"}
            </p>
          </div>
        </div>
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