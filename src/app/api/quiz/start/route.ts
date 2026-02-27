import { NextRequest } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!jobId) {
    return new Response("Job ID required", { status: 400 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(`${env.BACKEND_URL}/aptitude/start?jobId=${jobId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include", 
    cache: "no-store",
  });

  if (!res.ok) {
    return new Response("Failed to start aptitude test", { status: 500 });
  }

  const data = await res.json();

  return Response.json(data);
}
