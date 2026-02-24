import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/data/env/server";

import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { getCurrentUserId } from "@/lib/auth";
import { EditPersonalJobInfoForm } from "@/features/jobInfos/components/EditPersonalJobInfoForm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Loading } from "@/components/Loading";


export default async function JobInfoNewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <h1 className="text-3xl md:text-4xl">Edit Job Description</h1>

      <Card>
        <CardContent>
          <Suspense
            fallback={
            <Loading name="Loading Job info" />
          }
          >
            <SuspendedForm jobInfoId={jobInfoId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({ jobInfoId }: { jobInfoId: string }) {
  const userId = await getCurrentUserId();

  // if (userId == null) return redirectToSignIn()

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return <EditPersonalJobInfoForm jobInfo={jobInfo} jobId={jobInfoId} />;
}

async function getJobInfo(id: string, userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(`${env.BACKEND_URL}/personal-jobs/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
  });
  const data = await res.json();

  return data;
}
