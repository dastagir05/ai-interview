import { NextResponse } from "next/server";
import { env } from "@/data/env/server";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${env.BACKEND_URL}/practice-interview/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
