import { NextResponse } from "next/server";
import { env } from "@/data/env/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

  const res = await fetch(`${env.BACKEND_URL}/practice-interview/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`,
  },
  credentials: "include", 
  cache: "no-store", 
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
