export enum ExperienceLevel {
  JUNIOR = "JUNIOR",
  MID = "MID",
  SENIOR = "SENIOR",
}
export interface JobDetails {
  id: string;
  recruiterId: string;
  recruiterName: string;
  title: string;
  description: string;
  skillsRequired: string[];
  experienceLevel: ExperienceLevel;
  isActive: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestion {
  questionText: string;
  questionType: "TECHNICAL" | "BEHAVIORAL" | "SITUATIONAL";
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  orderInInterview: number;
}

export interface Question {
  id: string;
  jobId?: string;
  // heading: string;
  // descrioption: string;
  questionText: string;
  questionType: "TECHNICAL" | "BEHAVIORAL" | "SITUATIONAL" | string;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD" | string;
  orderInInterview: number;
  createdAt?: string;
}
