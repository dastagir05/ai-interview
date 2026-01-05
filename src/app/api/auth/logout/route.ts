import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/data/env/server";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  // Call backend logout
  if (token) {
    await fetch(`${env.BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Delete cookie
  cookieStore.delete("authToken");

  return NextResponse.json({ success: true });
}