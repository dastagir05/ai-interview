import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/data/env/server";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  let token = cookieStore.get("authToken")?.value;
 
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const response = await fetch(`${env.BACKEND_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", 
    });

    if (!response.ok) {
      console.log("ress", response.status)
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await response.json();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}