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
    "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED"
  >("IN_PROGRESS");
  const [results, setResults] = useState<CompleteInterviewResponse>();

  // Voice controls
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Text controls
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");

  // Status
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    initializeSession();
    initializeSpeechRecognition();
    startStatusPolling();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSession = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/practice-interview/${sessionId}`,
        {
          // headers: {
          //   'Authorization': `Bearer ${localStorage.getItem('token')}`
          // }
        }
      );
      const data = await response.json();
      setSession(data);

      if (data.status === "COMPLETED") {
        setInterviewState("COMPLETED");
        loadResults();
      }

      if (data.conversationHistory) {
        const history = JSON.parse(data.conversationHistory);
        const filtered = history.filter(
          (msg: ConversationMessage) => msg.role !== "system"
        );
        setConversation(filtered);

        if (data.status !== "COMPLETED" && filtered.length > 0) {
          const lastAI = filtered
            .filter((m: ConversationMessage) => m.role === "assistant")
            .pop();
          if (lastAI) {
            speakText(lastAI.content);
          }
        }
      }
    } catch (error) {
      console.error("Failed to initialize session:", error);
    }
  };

  const loadResults = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/practice-interview/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const startStatusPolling = () => {
    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/practice-interview/${sessionId}/status`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const status = await response.json();
        console.log("Polled status:", status);
        setTimeRemaining(status.timeRemaining || 0);
        setQuestionNumber(status.currentQuestion || 0);

        if (status.shouldComplete) {
          if (pollIntervalRef.current !== null) {
            clearInterval(pollIntervalRef.current);
          }
          handleCompleteInterview();
        }
      } catch (error) {
        console.error("Failed to poll status:", error);
      }
    }, 30000);
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
    if (!message.trim()) return;

    setLoading(true);
    setConversation((prev) => [...prev, { role: "user", content: message }]);
    setTextInput("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/practice-interview/message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ sessionId, message }),
        }
      );

      const data = await response.json();
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: data.aiResponse },
      ]);

      if (inputMode === "voice") {
        speakText(data.aiResponse);
      }

      if (data.shouldEnd) {
        setTimeout(() => handleCompleteInterview(), 2000);
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

    try {
      const response = await fetch(
        "http://localhost:8080/api/practice-interview/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ sessionId }),
        }
      );
    } catch (error) {
      console.error("Failed to start:", error);
    }
  };
  const handlePauseInterview = async () => {
    stopSpeaking();
    if (recognitionRef.current) recognitionRef.current.stop();

    try {
      await fetch("http://localhost:8080/api/practice-interview/pause", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      router.push(`/interviews/${jobId}`);
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
        "http://localhost:8080/api/practice-interview/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
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
              onClick={() => router.push(`/interviews/${jobId}`)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sessions
            </Button>
            <h1 className="text-3xl font-bold">Interview Completed! 🎉</h1>
            <p className="text-muted-foreground mt-2">{session.jobTitle}</p>
          </div>

          {/* Overall Score Card */}
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
                Question {questionNumber} of //session.expectedQuestions ?
                session.expectedQuestions : "N/A"
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p className="text-lg font-semibold">{timeRemaining} min</p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleStartInterview}
              >
                Start
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseInterview}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleCompleteInterview}
              >
                <X className="w-4 h-4 mr-2" />
                End
              </Button>
            </div>
          </div>

          <Progress value={timePercentage} className="mt-3 h-1" />
        </div>
      </div>

      {/* Conversation */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="min-h-[55vh] max-h-[55vh] overflow-hidden flex flex-col mb-6">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
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
                disabled={isSpeaking || loading}
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
                placeholder="Type your answer here... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-[100px]"
                disabled={loading}
              />
              <Button
                onClick={handleTextSubmit}
                disabled={loading || !textInput.trim()}
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
