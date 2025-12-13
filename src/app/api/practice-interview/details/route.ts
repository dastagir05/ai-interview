import { NextResponse } from "next/server";
import { env } from "@/data/env/server";

export async function POST(req: Request) {
  const { sessionId } = await req.json();

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
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await backendRes.json();

  return NextResponse.json(data, { status: backendRes.status });
}
