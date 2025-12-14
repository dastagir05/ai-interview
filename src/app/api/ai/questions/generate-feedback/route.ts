import { getCurrentUserId } from "@/lib/auth";
import { generateAiQuestionFeedback } from "@/services/ai/questions";
import z from "zod";

const schema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  jobInfoId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return new Response("Invalid request", { status: 400 });
  }

  const { question, answer } = parsed.data;

  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = generateAiQuestionFeedback({
    question,
    answer,
  });

  return res.toDataStreamResponse({ sendUsage: false });
}
