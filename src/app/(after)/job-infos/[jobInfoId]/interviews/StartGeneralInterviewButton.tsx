"use client";

import { Button } from "@/components/ui/button";
import { Loader2Icon, ZapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  jobInfoId: string;
  userId: string;
}

export function StartGeneralInterviewButton({ jobInfoId, userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/personalJobs/${jobInfoId}/interviews/general`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) throw new Error("Failed to create general interview");

      const data = await response.json();
      // Navigate to the session page — same flow as topic sessions
      router.push(
        `/job-infos/${jobInfoId}/interviews/${data.configurationId}/session/${data.sessionId}`
      );
    } catch (error) {
      console.error("Failed to start general interview:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleStart} disabled={loading} className="shrink-0">
      {loading ? (
        <Loader2Icon className="size- animate-spin mr-2" />
      ) : (
        <ZapIcon className="size-4 mr-2" />
      )}
      {loading ? "Starting..." : "Start Now"}
    </Button>
  );
}