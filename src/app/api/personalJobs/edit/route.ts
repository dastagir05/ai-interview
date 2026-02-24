import { NextRequest, NextResponse } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import { cookies } from "next/headers";

const { BACKEND_URL } = env;

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          skillsRequired,
          experienceLevel,
        }),
        credentials: "include",
        cache: "no-store",
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
