 export interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
  tier: string;
  interviewsCompleted: number | null;
  totalAchievements: number | null;
  memberSince : string | null;
 }

 export type UserTier = "FREE" | "BASIC" | "PRO";