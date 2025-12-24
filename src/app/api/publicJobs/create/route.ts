import { NextRequest, NextResponse } from "next/server";
import { env } from "@/data/env/server";

export async function POST(
    req: NextRequest
) {
  const body = await req.json();
  const res = await fetch(`${env.BACKEND_URL}/admin/practice-jobs`, {
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to fetch job" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
