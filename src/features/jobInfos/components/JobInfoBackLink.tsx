import { BackLink } from "@/components/BackLink";
import { env } from "@/data/env/server";

import { cn } from "@/lib/utils";
import { Suspense } from "react";

export function JobInfoBackLink({
  jobInfoId,
  className,
}: {
  jobInfoId: string;
  className?: string;
}) {
  return (
    <BackLink
      href={`/job-infos/${jobInfoId}`}
      className={cn("mb-4", className)}
    >
      <Suspense fallback="Job Description">
        <JobName jobInfoId={jobInfoId} />
      </Suspense>
    </BackLink>
  );
}

async function JobName({ jobInfoId }: { jobInfoId: string }) {
  const jobInfo = await getJobInfo(jobInfoId);
  return jobInfo?.name ?? "Job Description";
}

async function getJobInfo(id: string) {
  const res = await fetch(`${env.BACKEND_URL}/personalJobs/${id}`).then((res) =>
    res.json()
  );
  return res;
}
