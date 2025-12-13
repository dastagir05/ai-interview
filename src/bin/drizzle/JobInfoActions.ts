"use server";

import { db } from "@/drizzle/db";
import { ExperienceLevel, JobInfoTable } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";

export async function getJobInfos(userId: string) {
  return db.query.JobInfoTable.findMany({
    where: eq(JobInfoTable.userId, userId),
    orderBy: desc(JobInfoTable.updatedAt),
  });
}

export async function createJobInfo(formData: FormData) {
  const data = {
    userId: formData.get("userId") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    experienceLevel: formData.get("experienceLevel") as ExperienceLevel,
    title: (formData.get("title") as string) || null,
  };

  await db.insert(JobInfoTable).values(data);
}
