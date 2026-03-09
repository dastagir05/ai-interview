"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoIcon, ArrowRightIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

const VIDEO_INTERVIEW_LIMIT_BASIC = 2;
const VIDEO_MAX_MINUTES = 10;

export function VideoMockInterviewCard({ jobInfoId }: { jobInfoId: string }) {
  const { user } = useAuth();
  const tier = user?.tier ?? "FREE";
  const isLocked = tier === "FREE";
  const isBasic = tier === "BASIC";

  const description = isLocked
    ? "Record a video answer and get AI feedback. Upgrade to Basic or Pro to unlock."
    : isBasic
      ? `Record a video answer (max ${VIDEO_MAX_MINUTES} min) and get rubric feedback. ${VIDEO_INTERVIEW_LIMIT_BASIC} per month on Basic.`
      : `Record a video answer (max ${VIDEO_MAX_MINUTES} min) and get rubric feedback. Video saved for replay.`;

  if (isLocked) {
    return (
      <Link
        href="/upgrade"
        className="hover:scale-[1.01] transition-[transform_opacity] block"
      >
        <Card className="h-full flex items-start justify-between flex-row border-l-[3px] border-l-muted-foreground opacity-90 hover:shadow-md transition-shadow">
          <CardHeader className="flex-grow flex-row items-start gap-3 space-y-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted border border-border shrink-0">
              <LockIcon className="size-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold tracking-tight whitespace-nowrap text-muted-foreground">
                Video mock interview
              </CardTitle>
            </div>
            <CardDescription className="text-sm leading-relaxed pt-2">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pr-4 pl-0 shrink-0">
            <ArrowRightIcon className="size-4 text-muted-foreground mt-1" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link
      className="hover:scale-[1.01] transition-[transform_opacity]"
      href={`/job-infos/${jobInfoId}/interviews/video`}
    >
      <Card className="h-full flex items-start justify-between flex-row border-l-[3px] border-l-foreground hover:shadow-md transition-shadow">
        <CardHeader className="flex-grow flex-row items-start gap-3 space-y-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted border border-border shrink-0">
            <VideoIcon className="size-4 text-foreground" />
            <CardTitle className="text-base font-semibold tracking-tight whitespace-nowrap">
              Video mock interview
            </CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed pt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pr-4 pl-0 shrink-0">
          <ArrowRightIcon className="size-4 text-muted-foreground mt-1" />
        </CardContent>
      </Card>
    </Link>
  );
}
