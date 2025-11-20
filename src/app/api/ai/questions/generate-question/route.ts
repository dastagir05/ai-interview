import { db } from "@/drizzle/db";
import {
  JobInfoTable,
  questionDifficulties,
  QuestionTable,
} from "@/drizzle/schema";
import { insertQuestion } from "@/features/questions/db";
import { canCreateQuestion } from "@/features/questions/permissions";
import { getCurrentUserId } from "@/lib/auth";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { generateAiQuestion } from "@/services/ai/questions";
import { createDataStreamResponse } from "ai";
import { and, asc, eq } from "drizzle-orm";
import z from "zod";

const schema = z.object({
  prompt: z.enum(questionDifficulties),
  jobInfoId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response("Error generating your question", { status: 400 });
  }

  const { prompt: difficulty, jobInfoId } = result.data;
  const userId = await getCurrentUserId();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  if (!(await canCreateQuestion())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  const previousQuestions = await getQuestions(jobInfoId);

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const res = generateAiQuestion({
        previousQuestions,
        jobInfo,
        difficulty,
        onFinish: async (question) => {
          const { id } = await insertQuestion({
            text: question,
            jobInfoId,
            difficulty,
          });

          dataStream.writeData({ questionId: id });
        },
      });
      // console.log("generated question", res);
      res.mergeIntoDataStream(dataStream, { sendUsage: false });
    },
  });
}

async function getQuestions(jobInfoId: string) {
  return db.query.QuestionTable.findMany({
    where: eq(QuestionTable.jobInfoId, jobInfoId),
    orderBy: asc(QuestionTable.createdAt),
  });
}

async function getJobInfo(id: string, userId: string) {
  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
