import { InterviewStatus } from "@/data/type/interview";
export interface SessionDetailResponse {
  sessionId: string;
  jobTitle: string;
  status: InterviewStatus;
  startedAt: string; // ISO date-time string
  completedAt: string | null;
  messageCount: number;
  durationMinutes: number | null;
  overallScore: number | null;
  conversationHistory: ConversationMessage; // JSON string
}

export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface CompleteInterviewResponse {
  sessionId: string;

  overallScore: number | null;
  technicalScore: number | null;
  communicationScore: number | null;
  confidenceScore: number | null;
  problemSolvingScore: number | null;

  feedback: string | null;
  strengths: string | null;
  weaknesses: string | null;
  recommendations: string | null;

  totalQuestions: number;
  durationMinutes: number;
}
