import { NextRequest } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import { cookies } from "next/headers";

const { BACKEND_URL } = env;

// POST /api/jobs?recruiterId=123
export async function POST(req: NextRequest) {
  const recruiterId = req.nextUrl.searchParams.get("userId");
  const body = await req.json();
  const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }


  const response = await fetch(
    `${BACKEND_URL}/personal-jobs?userId=${recruiterId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`},
      credentials: "include", 
      body: JSON.stringify(body),
    }
  );

  return Response.json(await response.json(), { status: response.status });
}
