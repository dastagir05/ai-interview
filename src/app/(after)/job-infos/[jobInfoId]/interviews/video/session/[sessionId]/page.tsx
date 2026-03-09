"use client";

import { use, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AIInterviewSessionPage from "../../session";

export default function VideoSessionPage({
  params,
}: {
  params: Promise<{ jobInfoId: string; sessionId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { jobInfoId, sessionId } = use(params);
  const configurationId = searchParams.get("configurationId");

  const paramsPromise = useMemo(
    () =>
      Promise.resolve({
        jobInfoId,
        sessionId,
        interviewId: configurationId ?? "",
      }),
    [jobInfoId, sessionId, configurationId]
  );

  if (!configurationId) {
    router.replace(`/job-infos/${jobInfoId}/interviews/video`);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting to video interview…</p>
      </div>
    );
  }

  return (
    <AIInterviewSessionPage params={paramsPromise} videoRoute />
  );
}
