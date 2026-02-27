import { NextRequest } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const attemptId = req.nextUrl.searchParams.get("attemptId");
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!attemptId) {
    return new Response("attemptId required", { status: 400 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
//  console.log("attempId in route", attemptId)
  const res = await fetch(`${env.BACKEND_URL}/aptitude/review/${attemptId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
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
