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
  const limit = searchParams.get("limit") ?? "10";

  try {
    const res = await fetch(
      `${env.BACKEND_URL}/admin/activity?limit=${limit}`,
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
      const list: { id: string; type: string; message: string; createdAt: string }[] = [];
      return NextResponse.json(list);
    }

    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.activity ?? data.items ?? []);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([]);
  }
}
