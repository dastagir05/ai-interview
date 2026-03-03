import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  console.log("token in auth/callback", token)

  if (!token) {
    return NextResponse.redirect(new URL("/?error=missing_token", req.url));
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));

  res.cookies.set({
    name: "authToken",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
//   res.cookies.set({
//   name: "authToken",
//   value: token,
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//   path: "/",
// });

  return res;
}