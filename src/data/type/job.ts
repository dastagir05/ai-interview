export enum ExperienceLevel {
  JUNIOR = "JUNIOR",
  MID_LEVEL = "MID_LEVEL",
  SENIOR = "SENIOR",
}

export enum Category {
  DATABASE = "DATABASE",
  PROGRAMING = "PROGRAMING",
  FRONTEND = "FRONTEND",
  BACKEND = "BACKEND",
  FULLSTACK = "FULLSTACK"
}
export interface PersonalJobDetails {
  id: string;
  recruiterId: string;
  recruiterName: string;
  title: string;
  name: string | null;
  description: string;
  skillsRequired: string[];
  experienceLevel: ExperienceLevel | "JUNIOR";
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export type JobCategory = "PROGRAMMING" | "SYSTEM_DESIGN" | "FRAMEWORK";

export interface Job {
  id: string;
  title: string;
  logo: string;
  tech: string[];
  time: number;
  level: ExperienceLevel;
  category: JobCategory;
  subCategory: string;
  progress: number;
  description: string;
  started: boolean;
  personalJobId: string | null;
}

export interface PublicJobDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  imgUrl: string;
  skillsRequired: string[];
  experienceLevel: ExperienceLevel | "JUNIOR";
  createdAt: string;
  started: boolean;
  personalJobId: string | null;
  company: string;
  logo: string;
  tech: string[];
  estimatedTime: number;
  level: ExperienceLevel;
  subCategory: string;
  progress: number;
}

export interface CreateQuestion {
  questionText: string;
  questionType: "TECHNICAL" | "BEHAVIORAL" | "SITUATIONAL";
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  orderInInterview: number;
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

export interface PublicJob {
  id: string;
  title: string;
  category: string;
  imgUrl: string | null;
  enabled: boolean;
  experienceLevel: ExperienceLevel;
  usageCount: number;
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
