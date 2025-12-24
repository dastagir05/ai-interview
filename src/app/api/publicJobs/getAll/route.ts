import { NextResponse } from "next/server";
import { env } from "@/data/env/server";

export async function GET(
  req: Request,
) {

  const res = await fetch(`${env.BACKEND_URL}/admin/practice-jobs`, {
    headers: {
      "Content-Type": "application/json",
    },
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
