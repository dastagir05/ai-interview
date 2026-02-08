import { NextRequest } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest, { params }: { params: Promise<{ practiceJobId: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { practiceJobId } = await params;

  const res = await fetch(
    `${env.BACKEND_URL}/practice-jobs/${practiceJobId}/start?userId=${userId}`,
    { 
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
  }
  );

  if (!res.ok) {
    console.log(res)
    return new Response("Failed to start practice job", { status: 500 });
  }

  const data = await res.json();
  return Response.json(data);
}
