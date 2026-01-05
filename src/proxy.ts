import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
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

  return NextResponse.next();
};

export default withAuth(
  async function middleware(req) {
    const protectedResponse = await arcjetMiddleware(req);
    if (protectedResponse.status !== 200) {
      return protectedResponse;
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // // Check if the user is trying to access admin routes
        // if (req.nextUrl.pathname.startsWith("/admin")) {
        //   // Allow access to admin login page
        //   if (req.nextUrl.pathname === "/admin/login") {
        //     return true;
        //   }

        //   // For other admin routes, check if user has admin email
        //   return token?.email === "pinjaridastageer@gmail.com";
        // }

        if (pathname.startsWith("/dashboard")) {
          return !!token; 
        }
        return true;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
