import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { jobInfoId, difficulty } = body;
    if (!jobInfoId || !difficulty) {
      return new Response("Invalid request", { status: 400 });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const res = await fetch(
      `${env.BACKEND_URL}/questions/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", 
        cache: "no-store",
        body: JSON.stringify({
          jobInfoId,
          difficulty,
        }),
      }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to generate question' },
        { status: res.status }
      );
    }
    
    const question = await res.text();
    return NextResponse.json({ question }, { status: 200 });
    
  } catch (error) {
    console.error('Error in generateTechnicalQuestion route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
