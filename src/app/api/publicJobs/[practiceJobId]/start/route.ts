import { NextRequest } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { practiceJobId: string } }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(
    `${env.BACKEND_URL}/practice-jobs/${params.practiceJobId}/start?userId=${userId}`,
    { method: "POST" }
  );

  if (!res.ok) {
    return new Response("Failed to start practice job", { status: 500 });
  }

  const data = await res.json();
  return Response.json(data);
}
