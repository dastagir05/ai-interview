import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next";
import { NextResponse, NextRequest } from "next/server";
import { env } from "./data/env/server";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: 60, // 1 minute
      max: 100, // max 100 requests per interval
    }),
  ],
});

const arcjetMiddleware = async (req: Request) => {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json(
      { message: "Too many requests or suspicious activity." },
      { status: 429 }
    );
  }
  return null; 
  //return NextResponse.next();
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Run Arcjet protection
  const arcjetResult = await arcjetMiddleware(req);
  if (arcjetResult) return arcjetResult;

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("authToken")?.value;

    if (!token) {
      // Redirect to home/login if no token
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
