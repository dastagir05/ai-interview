import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/auth";
import { env } from "@/data/env/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = await getCurrentUserId();

  const res = await fetch(
    `${env.BACKEND_URL}/practice-jobs?userId=${userId}`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );

  const text = await res.text();

  if (!res.ok) {
    return NextResponse.json(
      { error: text },
      { status: res.status }
    );
  }

  // Now safe to parse
  return NextResponse.json(JSON.parse(text));
}
