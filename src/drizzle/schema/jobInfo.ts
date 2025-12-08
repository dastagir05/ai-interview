import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { desc, relations } from "drizzle-orm";
import { QuestionTable } from "./question";
import { InterviewTable } from "./interview";

export const experienceLevels = ["junior", "mid-level", "senior"] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];
export const experienceLevelEnum = pgEnum(
  "job_infos_experience_level",
  experienceLevels
);
export const JobInfoTable = pgTable("job_info", {
  id,
  title: varchar().notNull(),
  name: varchar(),
  experienceLevel: experienceLevelEnum().notNull(),
  userId: varchar().notNull(),
  description: varchar().notNull(),
  skillsRequired: varchar().array().default([]),
  createdAt,
  updatedAt,
});

export const jobInfoRelations = relations(JobInfoTable, ({ one, many }) => ({
  questions: many(QuestionTable),
  interviews: many(InterviewTable),
}));
