import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    
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
      `${env.BACKEND_URL}/api/questions/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.get("authorization") ?? "",
        },
        body: JSON.stringify({
          question,
          answer,
        }),
      }
    );

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
