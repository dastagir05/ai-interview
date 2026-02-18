import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SessionCardDTO } from "@/data/type/interview";
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { getCurrentUserId, requireUserId } from "@/lib/auth";
import {
  ArrowRightIcon,
  Loader2Icon,
  PlusIcon,
  ZapIcon,
  LayersIcon,
  ClockIcon,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { env } from "@/data/env/server";
import { Suspense } from "react";
import { StartGeneralInterviewButton } from "./StartGeneralInterviewButton"; // client component below

export default async function InterviewsPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container py-4 gap-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <Suspense
        fallback={<Loader2Icon className="size-24 animate-spin m-auto" />}
      >
        <SuspendedPage jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedPage({ jobInfoId }: { jobInfoId: string }) {
  const userId = await getCurrentUserId();
  const interviews = await getInterviews(jobInfoId, userId);

  // Filter out general interviews from topic sessions list
  const topicInterviews = interviews.filter(
    (i: SessionCardDTO) => !i.isGeneralInterview
  );

  return (
    <div className="space-y-8 w-full">
      {/* Page Header */}
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-3xl lg:text-4xl font-medium">Interviews</h1>
        {/* <Button asChild variant="outline">
          <Link href={`/job-infos/${jobInfoId}/interviews/new`}>
            <PlusIcon />
            New Topic Session
          </Link>
        </Button> */}
      </div>

      {/* ── Section 1: General Interview ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ZapIcon className="size-4 text-primary" />
          <h2 className="text-lg font-semibold">Quick Start</h2>
        </div>

        <Card className="border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between px-6">
            <div className="space-y-1">
              <p className="font-semibold text-base">General Interview</p>
              <p className="text-sm text-muted-foreground">
                Full JD coverage — AI picks topics naturally, just like a real interview
              </p>
            </div>
            {/* This is a client component to handle the POST + redirect */}
            <StartGeneralInterviewButton jobInfoId={jobInfoId} userId={userId} />
          </div>
        </Card>
      </section>

      {/* ── Section 2: Topic Sessions ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayersIcon className="size-4 text-primary" />
            <h2 className="text-lg font-semibold">Topic Sessions</h2>
          </div>
          <Button asChild size="sm">
            <Link href={`/job-infos/${jobInfoId}/interviews/new`}>
              <PlusIcon className="size-3" />
              Create SubTopic
            </Link>
          </Button>
        </div>

        {topicInterviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
              <LayersIcon className="size-8 text-muted-foreground/40" />
              <div>
                <p className="font-medium text-sm">No topic sessions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Break the interview into focused sessions like{" "}
                  <span className="font-medium">Node.js</span>,{" "}
                  <span className="font-medium">System Design</span>,{" "}
                  <span className="font-medium">CI/CD</span> and practice each
                  area deeply.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href={`/job-infos/${jobInfoId}/interviews/new`}>
                  <PlusIcon className="size-3" />
                  Create Topic Session
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 has-hover:*:not-hover:opacity-70">
            {topicInterviews.map((interview: SessionCardDTO) => (
              <Link
                className="hover:scale-[1.01] transition-[transform_opacity]"
                href={`/job-infos/${jobInfoId}/interviews/${interview.configurationId}`}
                key={interview.configurationId}
              >
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">
                        {interview.interviewTitle}
                      </CardTitle>
                      <ArrowRightIcon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    </div>
                    <CardDescription className="text-xs">
                      {interview.jobTitle}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    {/* Focus domains */}
                    {interview.focusDomains && interview.focusDomains.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {interview.focusDomains.map((domain: string) => (
                          <Badge
                            key={domain}
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {interview.durationMinutes && (
                        <span className="flex items-center gap-1">
                          <ClockIcon className="size-3" />
                          {interview.durationMinutes}m
                        </span>
                      )}
                      {interview.difficulty && (
                        <Badge
                          variant="outline"
                          className={`text-xs px-1.5 py-0 ${
                            interview.difficulty === "EASY"
                              ? "border-green-400 text-green-600"
                              : interview.difficulty === "MEDIUM"
                              ? "border-yellow-400 text-yellow-600"
                              : "border-red-400 text-red-600"
                          }`}
                        >
                          {interview.difficulty}
                        </Badge>
                      )}
                      <span className="ml-auto">
                        {interview.completedSessions ?? 0}/
                        {interview.totalSessions ?? 0} sessions
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

async function getInterviews(jobInfoId: string, userId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) return [];

    const response = await fetch(
      `${env.BACKEND_URL}/practice-interview/configuration/job/${jobInfoId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch interviews:", error);
    return [];
  }
}