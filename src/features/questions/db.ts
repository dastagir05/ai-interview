import { db } from "@/drizzle/db";
import { QuestionTable } from "@/drizzle/schema";

export async function insertQuestion(
  question: typeof QuestionTable.$inferInsert
) {
  const [newQuestion] = await db
    .insert(QuestionTable)
    .values(question)
    .returning({
      id: QuestionTable.id,
      jobInfoId: QuestionTable.jobInfoId,
    });

  return newQuestion;
}
