"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon, PlayIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  practiceJobId: string;
  started: boolean;
  personalJobId?: string | null;
};

export function PracticeJobAction({
  practiceJobId,
  started,
  personalJobId,
}: Props) {
  const router = useRouter();

  async function handleStart() {
    const res = await fetch(
      `/api/publicJobs/${practiceJobId}/start`,
      { method: "POST" }
    );

    if (!res.ok) {
      alert("Failed to start practice job");
      return;
    }

    const data = await res.json();

    router.push(`/personalJob`);
  }

  // Already started → Resume
  if (started && personalJobId) {
    return (
      <Button
        variant="ghost"
        onClick={() => router.push(`/personalJob`)} //href={`/job-infos/${jobInfo.id}`}
      >
        <ArrowRightIcon className="size-5" />
      </Button>
    );
  }

  // Not started → Start
  return (
    <Button onClick={handleStart}>
      <PlayIcon className="mr-2 size-4" />
      Start
    </Button>
  );
}
