import { NextResponse } from "next/server";
import { env } from "@/data/env/server";

export async function POST(req: Request) {
  const { userId, jobId } = await req.json();

  if (!userId || !jobId) {
    return NextResponse.json(
      { message: "userId and jobId are required" },
      { status: 400 }
    );
  }

  const backendRes = await fetch(
    `${env.BACKEND_URL}/practice-interview/user/${userId}/job/${jobId}/sessions`,
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
