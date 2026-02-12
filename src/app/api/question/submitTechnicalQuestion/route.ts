import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }
    const rawBody = await req.text(); 
    console.log("RAW BODY >>>", rawBody);

    const body = JSON.parse(rawBody);
    console.log("PARSED BODY >>>", body);
const { question, answer } = body;
    if (!question || !answer) {
      return new Response("Invalid request", { status: 400 });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const res = await fetch(
      `${env.BACKEND_URL}/questions/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include", 
        cache: "no-store",
        body: JSON.stringify({
          question,
          answer,
        }),
      }
    );
    console.log("res of technical", res)

    if (!res.ok) {
      const text = await res.text();
      return new Response(text, { status: res.status });
    }

    const feedback = await res.text();
    return new Response(feedback, { status: 200 });

  } catch (err: any) {
    return new Response(err.message ?? "Failed to submit answer", {
      status: 500,
    });
  }
}
