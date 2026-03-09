import { NextResponse } from "next/server";
import { env } from "@/data/env/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;
  const questionText = formData.get("questionText") as string | null;
  if (!audio || typeof audio.arrayBuffer !== "function" || !questionText) {
    return NextResponse.json(
      { message: "Missing audio file or questionText" },
      { status: 400 }
    );
  }

  const backendForm = new FormData();
  backendForm.append("audio", new Blob([await audio.arrayBuffer()], { type: audio.type || "audio/webm" }), audio.name || "recording.webm");
  backendForm.append("questionText", questionText);

  const res = await fetch(
    `${env.BACKEND_URL}/personal-jobs/${jobId}/video-interview/process-with-audio`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendForm,
      cache: "no-store",
    }
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
