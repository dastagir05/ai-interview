import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    console.error("❌ No token in callback URL");
    return NextResponse.redirect(new URL("/?error=no_token", req.url));
  }

  console.log("✅ Token received in callback:", token.substring(0, 20) + "...");

  try {
    const cookieStore = await cookies();
    
    cookieStore.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("✅ authToken cookie set successfully");

    return NextResponse.redirect(new URL("/dashboard", req.url));
    
  } catch (error) {
    console.error("❌ Error setting cookie:", error);
    return NextResponse.redirect(new URL("/?error=cookie_error", req.url));
  }
}