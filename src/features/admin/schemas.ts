import { ExperienceLevel, Category } from "@/data/type/job";
import z from "zod";

export const publicJobInfoSchema = z.object({
  title: z.string().min(1, "Required"),
  name: z.string().min(1).nullable(),
  imgUrl: z.string().min(1, "Required"),
  category: z.enum(
    Object.values(Category) as [string, ...string[]]
  ),
  experienceLevel: z.enum(
    Object.values(ExperienceLevel) as [string, ...string[]]
  ),
  description: z.string().min(1, "Required"),
  skillsRequired: z.array(z.string()),
});
