import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/data/env/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const body = await req.json();

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(
    `${env.BACKEND_URL}/users/change-email/init`,
    {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
