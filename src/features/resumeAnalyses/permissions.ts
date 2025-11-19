import { hasPermission } from "@/services/Oauth/lib/hasPermission";

export async function canRunResumeAnalysis() {
  return hasPermission("unlimited_resume_analysis");
}
