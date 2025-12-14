import { NextRequest } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import z from "zod";

const schema = z.object({
  jobId: z.string().min(1),
  answers: z.array(z.number()),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return new Response("Invalid payload", { status: 400 });
  }

  const { jobId, answers } = parsed.data;

  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(`${env.BACKEND_URL}/aptitude/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify({
      jobId,
      answers,
    }),
  });

  if (!res.ok) {
    return new Response("Failed to submit aptitude test", { status: 500 });
  }

  const result = await res.json();

  return Response.json(result);
}
