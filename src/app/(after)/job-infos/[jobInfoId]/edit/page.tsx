import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/data/env/server";

import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm";
import { getCurrentUserId } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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
            fallback={<Loader2 className="size-24 animate-spin mx-auto" />}
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

  return <JobInfoForm jobInfo={jobInfo} />;
}

async function getJobInfo(id: string, userId: string) {
  const res = await fetch(`${env.BACKEND_URL}/personal-jobs/${id}`).then(
    (res) => res.json()
  );
  return res;
}
