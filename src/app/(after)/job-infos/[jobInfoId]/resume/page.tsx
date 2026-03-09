import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { Suspense } from "react";
import { ResumePageClient } from "./_client";
import { Loading } from "@/components/Loading";

export default async function ResumePage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <Suspense
        fallback={<Loading name="Loading Resume" />}
      >
        <SuspendedComponent jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  return <ResumePageClient jobInfoId={jobInfoId} />;
}
