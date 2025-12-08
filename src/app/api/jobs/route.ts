import { NextRequest } from "next/server";
import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";

const { BACKEND_URL } = env;

// POST /api/jobs?recruiterId=123
export async function POST(req: NextRequest) {
  const recruiterId = req.nextUrl.searchParams.get("recruiterId");
  const body = await req.json();

  const response = await fetch(
    `${BACKEND_URL}/jobs?recruiterId=${recruiterId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  return Response.json(await response.json(), { status: response.status });
}
// export async function GET(req: NextRequest) {
//   // read recruiterId from query params
//   const recruiterId = req.nextUrl.searchParams.get("recruiterId");

//   if (!recruiterId) {
//     return Response.json({ error: "Missing recruiterId" }, { status: 400 });
//   }

//   const response = await fetch(`${BACKEND_URL}/jobs/recruiter/${recruiterId}`);

//   return Response.json(await response.json(), { status: response.status });
// }
