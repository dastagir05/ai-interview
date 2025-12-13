import { ExperienceLevel } from "@/data/type/job";

export function formatExperienceLevel(level: ExperienceLevel) {
  switch (level) {
    case "JUNIOR":
      return "Junior";
    case "MID_LEVEL":
      return "Mid-Level";
    case "SENIOR":
      return "Senior";
    default:
      return level;
  }
}
