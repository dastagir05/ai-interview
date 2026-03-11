import { NextResponse } from "next/server";
import { env } from "@/data/env/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";
  const limit = searchParams.get("limit") ?? "10";

  try {
    const res = await fetch(
      `${env.BACKEND_URL}/admin/analytics/top-jobs?range=${range}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.jobs ?? data.topJobs ?? []);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([]);
  }
}
