import { getCurrentUserId } from "@/lib/auth";
import { env } from "@/data/env/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const formData = await req.formData();
  const resumeFile = formData.get("resumeFile") as File;
  const jobInfoId = formData.get("jobInfoId") as string;

  if (!resumeFile || !jobInfoId) {
    return new Response("Invalid request", { status: 400 });
  }

  if (resumeFile.size > 10 * 1024 * 1024) {
    return new Response("File size exceeds 10MB limit", { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!allowedTypes.includes(resumeFile.type)) {
    return new Response("Please upload a PDF, Word document, or text file", {
      status: 400,
    });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const jobInfo = await getJobInfo(jobInfoId, token);
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  // Forward to Spring Boot backend
  const backendFormData = new FormData();
  backendFormData.append("resumeFile", resumeFile);
  backendFormData.append("jobDescription", jobInfo.description ?? "");
  backendFormData.append("experienceLevel", jobInfo.experienceLevel ?? "");
  if (jobInfo.title) {
    backendFormData.append("jobTitle", jobInfo.title);
  }

  const backendRes = await fetch(`${env.BACKEND_URL}/resume/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: backendFormData,
  });

  if (!backendRes.ok) {
    const errorText = await backendRes.text();
    return new Response(errorText || "Resume analysis failed", {
      status: backendRes.status,
    });
  }

  const data = await backendRes.json();
  return Response.json(data);
}

async function getJobInfo(id: string, token: string) {
  const res = await fetch(`${env.BACKEND_URL}/personal-jobs/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-cache",
  });

  if (!res.ok) return null;
  return res.json();
}