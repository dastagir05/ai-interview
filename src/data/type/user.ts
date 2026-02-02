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
//   interviewsCompleted: number;
//   joinedDate: string;
 }

 export type UserTier = "FREE" | "BASIC" | "PRO";