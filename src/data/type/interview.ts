export interface SessionCardDTO {
  isGeneralInterview: boolean;
  configurationId: string;
  sessionId: string;
  interviewTitle: string;
  interviewId: string;
  plannedDuration: number;
  jobTitle: string;
  focusDomains: string[];
  status: InterviewStatus;
  createdAt: string; // ISO string from backend
  completedAt: string | null;
  durationMinutes: number | null;
  expectedQuestions: number;
  completedSessions:number;
  totalSessions: number;
  actualQuestions: number;
  overallScore: number | null;
  difficulty: DifficultyLevel;
  canResume: boolean;
}
export interface InterviewCardDTO {
  configurationId: string;
  interviewTitle: string;
  jobTitle: string;
  jobDescription: string;
  focusDomains: string[];
  difficulty:string;
  isActive: Boolean;
  createdAt: string; // ISO string from backend
  durationMinutes: number | null;
  expectedQuestions: number;
  includeCodeChallenges: Boolean;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
}

export enum InterviewStatus {
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
  PAUSED = "PAUSED",
  NOT_STARTED = "NOT_STARTED",
}

export enum DifficultyLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export interface SessionFullDetailsDTO {
  // Basic info
  sessionId: string;
  interviewTitle: string;
  jobTitle: string;
  jobDescription: string;
  focusDomains: string[];

  // Status & timing
  status: InterviewStatus;
  createdAt: string; // ISO date-time
  startedAt: string | null;
  completedAt: string | null;
  plannedDuration: number | null;
  actualDuration: number | null;

  // Questions
  expectedQuestions: number;
  actualQuestions: number;

  // Configuration
  difficulty: DifficultyLevel;
  includeCodeChallenges: boolean;

  // Scores (if completed)
  overallScore: number | null;
  technicalScore: number | null;
  communicationScore: number | null;
  confidenceScore: number | null;
  problemSolvingScore: number | null;

  // Feedback (if completed)
  feedback: string | null;
  strengths: string | null;
  weaknesses: string | null;
  recommendations: string | null;

  // Extra
  resumeUrl: string | null;
  canResume: boolean;
  messageCount: number;
}
