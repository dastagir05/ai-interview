import { env } from "@/data/env/server";
import { getCurrentUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { jobInfoId, difficulty } = body;
    if (!jobInfoId || !difficulty) {
      return new Response("Invalid request", { status: 400 });
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Call Java backend
    const res = await fetch(
      `${env.BACKEND_URL}/questions/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // forward auth if needed
          Authorization: req.headers.get("authorization") ?? "",
        },
        body: JSON.stringify({
          jobInfoId,
          difficulty,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return new Response(text, { status: res.status });
    }
    // IMPORTANT: return plain text for useCompletion
    const question = await res.text();
    console.log("res from back url", question)
    const QString = question.replace(/^```markdown\s*/, "").replace(/```$/, "").trim()
    return NextResponse.json({
      QString
    });

  } catch (err: any) {
    return new Response(err.message ?? "Failed to generate question", {
      status: 500,
    });
  }
}
