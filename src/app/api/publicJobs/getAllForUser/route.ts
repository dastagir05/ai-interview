import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/data/env/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("authToken")?.value;

  if (!accessToken) {
    console.log("❌Unauthorized from getAllForUser route");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const res = await fetch(
    `${env.BACKEND_URL}/practice-jobs`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

  return NextResponse.json(JSON.parse(text));
}
