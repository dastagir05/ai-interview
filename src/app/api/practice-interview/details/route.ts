import { NextResponse } from "next/server";
import { env } from "@/data/env/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!sessionId) {
    return NextResponse.json(
      { message: "userId and jobId are required" },
      { status: 400 }
    );
  }

  const backendRes = await fetch(
    `${env.BACKEND_URL}/practice-interview/${sessionId}/details`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`,
  },
  credentials: "include", 
  cache: "no-store", 
    }
  );

  const data = await backendRes.json();

  return NextResponse.json(data, { status: backendRes.status });
}
