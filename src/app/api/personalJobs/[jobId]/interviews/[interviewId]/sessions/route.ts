import { NextResponse } from "next/server";
import { env } from "@/data/env/server";
import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/auth";

// GET - Get all sessions for an interview
export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string; interviewId: string }> }
) {
  const { jobId, interviewId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(
    // `${env.BACKEND_URL}/practice-interview/${jobId}/interviews/${interviewId}/sessions`,   get all session for specific interview`s 
    `${env.BACKEND_URL}/practice-interview/configuration/${interviewId}/sessions`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      cache: "no-store",
    }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST - Create a new session for an interview
export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string; interviewId: string }> }
) {
  const body = await req.json();
  const { jobId, interviewId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
 const userId = await getCurrentUserId();
  const res = await fetch(
    `${env.BACKEND_URL}/practice-interview/session/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({"configurationId": `${interviewId}`, "userId": `${userId}`}),
    }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

