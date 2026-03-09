import { VideoInterviewClient } from "./VideoInterviewClient";
import { env } from "@/data/env/server";
import { cookies } from "next/headers";
import { requireUserId } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function VideoInterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  await requireUserId();

  const job = await fetch(`${env.BACKEND_URL}/personal-jobs/${jobInfoId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  }).then((r) => (r.ok ? r.json() : null));

  if (!job) return notFound();

  return (
    <div className="container py-2 gap-2 flex flex-col items-start">
      <VideoInterviewClient
        jobInfoId={jobInfoId}
        jobTitle={job.title ?? "Job"}
      />
    </div>
  );
}
