import { NextRequest, NextResponse } from "next/server";
import { env } from "@/data/env/server";
import { cookies } from "next/headers";
export async function POST(
    req: NextRequest
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await req.json();
  const res = await fetch(`${env.BACKEND_URL}/admin/practice-jobs`, {
    method:"POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
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
