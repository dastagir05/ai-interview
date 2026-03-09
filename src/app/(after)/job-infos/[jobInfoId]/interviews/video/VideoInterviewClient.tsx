"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { VideoIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

export function VideoInterviewClient({
  jobInfoId,
  jobTitle,
}: {
  jobInfoId: string;
  jobTitle: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStartVideoInterview = async () => {
    const userId = user?.id;
    if (!userId) {
      toast.error("Please sign in to start the interview.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/personalJobs/${jobInfoId}/interviews/general`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 403 || err.message?.includes("tier") || err.message?.includes("limit")) {
          toast.error("Interview limit reached or upgrade required.");
        } else {
          toast.error("Failed to start interview.");
        }
        setLoading(false);
        return;
      }
      const data = await response.json();
      router.push(
        `/job-infos/${jobInfoId}/interviews/${data.configurationId}/session/${data.sessionId}?video=1`
      );
    } catch (e) {
      toast.error("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="container py-2 gap-2 flex flex-col items-start max-w-2xl">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <h1 className="text-2xl font-semibold">Video mock interview</h1>
      <p className="text-muted-foreground text-sm">{jobTitle}</p>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <VideoIcon className="size-5 text-muted-foreground" />
            <CardTitle className="text-lg">Same as voice interview, with camera on</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            AI will ask questions and follow-ups based on your answers. You answer by voice. Your camera will be on so you can see yourself; only your voice is sent for analysis.
          </p>
          <p className="text-sm text-muted-foreground">
            One session (about 10 min), then you get feedback with scores and recommendations.
          </p>
          <Button
            onClick={handleStartVideoInterview}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <VideoIcon className="size-4" />
            )}
            {loading ? "Starting..." : "Start video interview"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
