import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

type Permission =
  | "unlimited_resume_analysis"
  | "unlimited_interviews"
  | "unlimited_questions"
  | "1_interview"
  | "5_questions";

export async function hasPermission(permission: Permission) {
  const session = await getServerSession(authOptions);
  const userPermissions = session?.user?.permissions ?? [];
  console.log("User permissions:", userPermissions);
  return userPermissions.includes(permission);
}
