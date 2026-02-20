export interface UserAnalytics {
    metrics: AnalyticsMetricsDTO;
    skills: SkillBreakdownDTO;
    dailyActivity: DailyActivityDTO[];
    recentInterviews: RecentInterviewDTO[];
    aptitudeStats: AptitudeDTO;
    interviewAnalytics: InterviewAnalytics;
  }

  export interface InterviewAnalytics{
    excellent: number;
    good: number;
    decent:number;
    fail:number;
    totalCompleted: number
  }

  export interface AptitudeDTO{
    totalAptitudeAttempts: number;
    avgAptitudeScore: number;
  }
  
  export interface AnalyticsMetricsDTO {
    totalInterviews: number;
    passRate: number;
    failRate: number;
    averageScore: number;
    activeDays: number;
    currentStreak: number;
    longestStreak: number;
  }

  export interface SkillBreakdownDTO {
    technical: number;
    problemSolving: number;
    confidence: number;
    communication: number;
  }
  
  export interface DailyActivityDTO {
    date: string;        // LocalDate -> ISO string (yyyy-MM-dd)
    interviews: number;
    avgScore: number;
  }

  export interface RecentInterviewDTO {
    role: string;
    score: number;
    status: string;      
    date: string;        
    skills: SkillBreakdownDTO;
  }
  