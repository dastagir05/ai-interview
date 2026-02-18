"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Plus, Clock, CheckCircle, PlayCircle, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SessionCardDTO,
  SessionFullDetailsDTO,
  InterviewStatus,
  InterviewCardDTO
} from "@/data/type/interview";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function InterviewSessionsPage({
  params,
}: {
  params: Promise<{ jobInfoId: string; interviewId: string }>;
}) {
  const { jobInfoId } = use(params);
  const { interviewId } = use(params);
  const jobId = jobInfoId;
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionCardDTO[]>([]);
  const [interviewDetail, setInterviewDetail] = useState<InterviewCardDTO>();
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionFullDetailsDTO>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchInterviewDetails();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/personalJobs/${jobId}/interviews/${interviewId}/sessions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchInterviewDetails = async () => {
    try {
      const response = await fetch(`/api/personalJobs/${jobId}/interviews/${interviewId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setInterviewDetail(data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (sessionId: String) => {
    try {
      const response = await fetch(`/api/personalJobs/${jobId}/interviews/${interviewId}/sessions/${sessionId}/details`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setSelectedSession(data);
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch session details:", error);
    }
  };

  const handleCreateSession = async () => {
    try {
      const response = await fetch(
        `/api/personalJobs/${jobId}/interviews/${interviewId}/sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      // Navigate to the new session page
      router.push(`${interviewId}/session/${data.sessionId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session. Please try again.");
    }
  };

  const handleResumeInterview = async (sessionId: String) => {
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

      // Navigate to session page after successful resume
      router.push(`${interviewId}/session/${sessionId}`);
    } catch (error) {
      console.error("Failed to resume interview:", error);
      alert("Failed to resume interview. Please try again.");
    }
  };

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "NOT_STARTED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: InterviewStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <PlayCircle className="w-4 h-4" />;
      case "PAUSED":
        return <Pause className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Interview Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Practice and track your interview progress
          </p>
        </div>
        <Button
          onClick={handleCreateSession}
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Session
        </Button>
      </div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
          <h2 className="text-2xl font-bold tracking-tight">Interview Description</h2>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-6 pt-4">
        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Interview Title
                </Label>
                <p className="text-base font-medium mt-1">
                  {interviewDetail?.interviewTitle || "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Job Title
                </Label>
                <p className="text-base font-medium mt-1">
                  {interviewDetail?.jobTitle || "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Difficulty Level
                </Label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      interviewDetail?.difficulty === "EASY"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : interviewDetail?.difficulty === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {interviewDetail?.difficulty || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Progress & Domains */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress & Focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Sessions Progress
                </Label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            interviewDetail?.totalSessions
                              ? (interviewDetail.completedSessions /
                                  interviewDetail.totalSessions) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {interviewDetail?.completedSessions || 0} /{" "}
                    {interviewDetail?.totalSessions || 0}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Focus Domains
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {interviewDetail?.focusDomains &&
                  interviewDetail.focusDomains.length > 0 ? (
                    interviewDetail.focusDomains.map((domain: string) => (
                      <span
                        key={domain}
                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {domain}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No focus domains specified
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Width - Job Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {interviewDetail?.jobDescription || "No description provided"}
            </p>
          </CardContent>
        </Card>
      </CollapsibleContent>

      {/* <CollapsibleContent className="space-y-6 pt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {interviewDetail?.jobDescription || "No description provided"}
            </p>
          </CardContent>
        </Card>
      </CollapsibleContent> */}

    </Collapsible>

          
      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  No sessions yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first practice session to get started
                </p>
                <Button onClick={handleCreateSession}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card
              key={session.sessionId}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCardClick(session.sessionId)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">
                    {session.interviewTitle}
                  </CardTitle>
                  <Badge className={getStatusColor(session.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(session.status)}
                      {session.status.replace("_", " ")}
                    </span>
                  </Badge>
                </div>
                <CardDescription>{session.jobTitle}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Focus Domains */}
                  {session.focusDomains && session.focusDomains.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {session.focusDomains.map((domain, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {session.plannedDuration} min
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Questions</p>
                      <p className="font-medium">
                        {session.actualQuestions || session.expectedQuestions}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Difficulty</p>
                      <p className="font-medium capitalize">
                        {session.difficulty?.toLowerCase()}
                      </p>
                    </div>
                    {session.overallScore && (
                      <div>
                        <p className="text-muted-foreground">Score</p>
                        <p className="font-medium text-green-600">
                          {Math.round(session.overallScore)}/100
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    {session.completedAt
                      ? `Completed: ${new Date(
                          session.completedAt
                        ).toLocaleDateString()}`
                      : `Created: ${new Date(
                          session.createdAt
                        ).toLocaleDateString()}`}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (session.status === "PAUSED") {
                        handleResumeInterview(session.sessionId);
                      } else {
                        router.push(`${interviewId}/session/${session.sessionId}`);
                      }
                    }}
                    size="lg"
                  >
                    {session.status === "NOT_STARTED" 
                      ? "Start Interview" 
                      : session.status === "PAUSED"
                      ? "Resume Interview"
                      : "View Stat"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedSession.interviewTitle}
                </DialogTitle>
                <DialogDescription>
                  {selectedSession.jobTitle}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status & Actions */}
                <div className="flex justify-between items-center">
                  <Badge className={getStatusColor(selectedSession.status)}>
                    {selectedSession.status.replace("_", " ")}
                  </Badge>
                  {selectedSession.status === "IN_PROGRESS" &&
                    selectedSession.canResume && (
                      <Button
                        onClick={() =>
                          handleResumeInterview(selectedSession.sessionId)
                        }
                      >
                        Resume Interview
                      </Button>
                    )}
                </div>

                {/* Focus Domains */}
                {selectedSession.focusDomains &&
                  selectedSession.focusDomains.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Focus Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSession.focusDomains.map((domain, idx) => (
                          <Badge key={idx} variant="secondary">
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-medium">
                      {selectedSession.actualDuration ||
                        selectedSession.plannedDuration}{" "}
                      minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="text-lg font-medium">
                      {selectedSession.actualQuestions ||
                        selectedSession.expectedQuestions}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <p className="text-lg font-medium capitalize">
                      {selectedSession.difficulty?.toLowerCase()}
                    </p>
                  </div>
                  {selectedSession.overallScore && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Overall Score
                      </p>
                      <p className="text-lg font-medium text-green-600">
                        {Math.round(selectedSession.overallScore)}/100
                      </p>
                    </div>
                  )}
                </div>

                {/* Detailed Scores */}
                {selectedSession.status === "COMPLETED" && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-3">Detailed Scores</h4>
                      <div className="space-y-2">
                        <ScoreBar
                          label="Technical"
                          score={selectedSession.technicalScore}
                        />
                        <ScoreBar
                          label="Communication"
                          score={selectedSession.communicationScore}
                        />
                        <ScoreBar
                          label="Confidence"
                          score={selectedSession.confidenceScore}
                        />
                        <ScoreBar
                          label="Problem Solving"
                          score={selectedSession.problemSolvingScore}
                        />
                      </div>
                    </div>

                    {/* Strengths */}
                    {selectedSession.strengths && (
                      <div>
                        <h4 className="font-semibold mb-2">Strengths</h4>
                        <div className="bg-green-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                          {selectedSession.strengths}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {selectedSession.weaknesses && (
                      <div>
                        <h4 className="font-semibold mb-2">
                          Areas for Improvement
                        </h4>
                        <div className="bg-yellow-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                          {selectedSession.weaknesses}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {selectedSession.recommendations && (
                      <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <div className="bg-blue-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                          {selectedSession.recommendations}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const percentage = Math.round(score || 0);
  const getColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">{percentage}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
