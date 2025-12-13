import { ExperienceLevel } from "@/data/type/job";
import z from "zod";

export const jobInfoSchema = z.object({
  title: z.string().min(1, "Required"),
  name: z.string().min(1).nullable(),
  experienceLevel: z.enum(
    Object.values(ExperienceLevel) as [string, ...string[]]
  ),
  description: z.string().min(1, "Required"),
  skillsRequired: z.array(z.string()),
});
