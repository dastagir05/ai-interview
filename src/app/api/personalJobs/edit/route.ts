import { NextRequest, NextResponse } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/authFromJava";

const { BACKEND_URL } = env;

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const { jobId, title, description, skillsRequired, experienceLevel } = body;

    if (!jobId) {
      return NextResponse.json(
        { message: "jobId is required" },
        { status: 400 }
      );
    }
    const userId = await getCurrentUserId();

    const backendRes = await fetch(
      `${BACKEND_URL}/personal-jobs/${jobId}?userId=${userId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          skillsRequired,
          experienceLevel,
        }),
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("Update job error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
