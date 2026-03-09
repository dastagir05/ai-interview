"use client";

import { BackLink } from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function JobInfoBackLink({
  jobInfoId,
  className,
}: {
  jobInfoId: string;
  className?: string;
}) {
  const [jobName, setJobName] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    const fetchJobName = async () => {
      try {
        const res = await fetch(`/api/personalJobs/${jobInfoId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!canceled) setJobName(data?.name ?? null);
      } catch {
        // ignore
      }
    };

    fetchJobName();

    return () => {
      canceled = true;
    };
  }, [jobInfoId]);

  return (
    <BackLink
      href={`/job-infos/${jobInfoId}`}
      className={cn("mb-3", className)}
    >
      {jobName ?? "Job Description"}
    </BackLink>
  );
}
