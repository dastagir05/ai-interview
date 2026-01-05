import { NextRequest } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import z from "zod";
import { cookies } from "next/headers";

const schema = z.object({
  attemptId: z.string().min(1),
  answers: z.array(z.number()),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return new Response("Invalid payload", { status: 400 });
  }

  const { attemptId, answers } = parsed.data;
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  console.log("apt ans", answers);

  const res = await fetch(`${env.BACKEND_URL}/aptitude/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  
    credentials: "include", 
    cache: "no-store",
    body: JSON.stringify({
      attemptId,
      answers,
    }),

  });

  if (!res.ok) {
    return new Response("Failed to submit aptitude test", { status: 500 });
  }

  const result = await res.json();

  return Response.json(result);
}
