import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InterviewCardDTO, SessionCardDTO } from "@/data/type/interview";
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { getCurrentUserId } from "@/lib/auth";
import {
  ArrowRightIcon,
  Loader2Icon,
  PlusIcon,
  ZapIcon,
  LayersIcon,
  ClockIcon,
  CalendarIcon,
  PlayCircleIcon,
  HistoryIcon,
  TargetIcon,
  BarChart2Icon,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { env } from "@/data/env/server";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { StartGeneralInterviewButton } from "./StartGeneralInterviewButton";

export default async function InterviewsPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container py-2 gap-2 h-screen-header flex flex-col ">
      <Suspense
        fallback={
        <Loading name="Loading Interviews" />
      }
      >
        <SuspendedPage jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedPage({ jobInfoId }: { jobInfoId: string }) {
  const userId = await getCurrentUserId();
  const topicInterviews = await getInterviews(jobInfoId, userId);
  // const topicInterviews = allConfigs.filter(
  //   (i: InterviewCardDTO) => !i.isGeneralInterview
  // );

  const totalTopics = topicInterviews.length;
  let totalSessions = 0;
  let completedSessions = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  let lastSessionAt: string | null = null;

  for (const config of topicInterviews) {
    const total = config.totalSessions ?? 0;
    const completed = config.completedSessions ?? 0;
    totalSessions += total;
    completedSessions += completed;

    if (config.averageScore != null) {
      scoreSum += config.averageScore;
      scoreCount += 1;
    }

    if (config.lastSessionAt) {
      if (!lastSessionAt || config.lastSessionAt > lastSessionAt) {
        lastSessionAt = config.lastSessionAt;
      }
    }
  }

  const overallAvgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null;
  const lastPracticedRelative = formatRelativeTime(lastSessionAt);

  return (
    <div className="space-y-0 w-full">
      {/* Page Header */}
      <div className="flex gap-2 justify-between items-center">
        <div>
          <h1 className="text-3xl lg:text-4xl font-medium">
            <JobInfoBackLink jobInfoId={jobInfoId} />
            Interviews
          </h1>
          <div className="mb-4 px-4 md:px-6 hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <HistoryIcon className="size-3" />
            <span className=" text-muted-foreground text-sm font-medium">
            Last practiced{" "}
              {lastPracticedRelative ?? "not yet started"}
            </span>
          </div>
        </div>


      {/* Job-level summary */}
      {totalTopics > 0 && (
        <section>
          <Card className="border-dashed bg-muted/40">
            <CardContent className="py-3 px-4 md:px-6 flex flex-wrap gap-4 md:gap-8 items-center justify-between">
              {/* Topics */}
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 text-primary p-2">
                  <LayersIcon className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Topics
                  </p>
                  <p className="text-sm font-semibold">{totalTopics}</p>
                </div>
              </div>

              {/* Sessions */}
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 text-primary p-2">
                  <PlayCircleIcon className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Sessions
                  </p>
                  <p className="text-sm font-semibold">
                    {completedSessions}/{totalSessions}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      completed
                    </span>
                  </p>
                </div>
              </div>

              {/* Score + last practiced */}
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 text-primary p-2">
                    <TargetIcon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Avg score
                    </p>
                    {overallAvgScore != null ? (
                      <p className="text-sm font-semibold">
                        {overallAvgScore}/100
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No scores yet
                      </p>
                    )}
                  </div>
                </div>

            </CardContent>

          </Card>
        </section>
      )}
      </div>



      {/* ── Section 1: General Interview ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ZapIcon className="size-4 text-primary" />
          <h2 className="text-lg font-semibold">Quick Start</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <Card className="border-primary/30 bg-primary/5 pb-0">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="space-y-1">
                <p className="font-semibold text-base">General Interview</p>
                <p className="text-sm text-muted-foreground mr-6">
                  Full JD coverage — AI picks topics naturally, just like a real
                  interview
                </p>
              </div>
              <StartGeneralInterviewButton jobInfoId={jobInfoId} userId={userId} />
            </div>
          </Card>

          <Card className="border-primary/30 bg-primary/5 pb-0">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="space-y-1">
                <p className="font-semibold text-base">Sub Topic Interview</p>
                <p className="text-sm text-muted-foreground mr-6">
                  Practice a specific topic or skill set in-depth
                </p>
              </div>
              <Button asChild size="sm">
                <Link href={`/job-infos/${jobInfoId}/interviews/new`}>
                  <PlusIcon className="size-3" />
                  Create SubTopic
                </Link>
              </Button>
            </div>
          </Card>
        </div>

      </section>

      {/* ── Section 2: Topic Sessions ── */}
      <section className="space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayersIcon className="size-4 text-primary" />
            <h2 className="text-lg font-semibold">Topic Sessions</h2>
            {topicInterviews.length > 0 && (
              <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {topicInterviews.length}
              </span>
            )}
          </div>
          
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
            {topicInterviews.map((interview: InterviewCardDTO) => (
              <TopicCard
                key={interview.configurationId}
                interview={interview}
                jobInfoId={jobInfoId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} wk ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scoreColor(score: number | null | undefined): string {
  if (score == null) return "text-muted-foreground";
  if (score >= 70) return "text-green-600";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

// ─── Topic Card ───────────────────────────────────────────────────────────────

function TopicCard({
  interview,
  jobInfoId,
}: {
  interview: InterviewCardDTO;
  jobInfoId: string;
}) {
  const completed = interview.completedSessions ?? 0;
  const total = interview.totalSessions ?? 0;
  const score = interview.averageScore;
  const createdDate = formatDate(interview.createdAt);
  const lastScore = interview.lastSessionScore;
  const lastSessionAt = interview.lastSessionAt;
  const lastPracticedRelative = formatRelativeTime(lastSessionAt);

  const difficultyStyle =
    interview.difficulty === "EASY"
      ? "border-green-400/60 text-green-600 bg-green-50 dark:bg-green-950/30"
      : interview.difficulty === "MEDIUM"
      ? "border-yellow-400/60 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30"
      : "border-red-400/60 text-red-600 bg-red-50 dark:bg-red-950/30";

  return (
    <Link
      className="hover:scale-[1.01] transition-[transform_opacity]"
      href={`/job-infos/${jobInfoId}/interviews/${interview.configurationId}`}
    >
      <Card className="h-full hover:border-primary/40 hover:shadow-sm transition-all group overflow-hidden p-0">
        <div className="flex h-full">

          {/* ── Left: title, tags, meta ── */}
          <div className="flex-1 min-w-0 px-5 py-4 flex flex-col gap-3">
            {/* Title + arrow */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-snug truncate">
                  {interview.interviewTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {interview.jobTitle}
                </p>
              </div>
              <ArrowRightIcon className="size-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Focus domain badges */}
            {interview.focusDomains && interview.focusDomains.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {interview.focusDomains.map((domain: string) => (
                  <Badge
                    key={domain}
                    variant="secondary"
                    className="text-xs px-2 py-0 h-5 font-normal"
                  >
                    {domain}
                  </Badge>
                ))}
              </div>
            )}
            {/* Last practiced + last score */}
          {(lastPracticedRelative != null || lastScore != null) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 ">
              {lastPracticedRelative != null && (
                <div className="flex items-center gap-1">
                  {/* <HistoryIcon className="size-3" /> */}
                  <span>Last practiced {lastPracticedRelative}</span>
                </div>
              )}
              {lastScore != null && (
                <span className="font-medium text-foreground">
                  Last score: {Math.round(lastScore)}/100
                </span>
              )}
            </div>
          )}

            {/* Bottom meta: duration + difficulty + date */}
            <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {interview.durationMinutes && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="size-3" />
                  {interview.durationMinutes}m
                </span>
              )}
              {interview.difficulty && (
                <Badge
                  variant="outline"
                  className={`text-xs px-1.5 py-0 h-5 font-medium ${difficultyStyle}`}
                >
                  {interview.difficulty}
                </Badge>
              )}
              {createdDate && (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  {createdDate}
                </span>
              )}
            </div>
          </div>

          {/* ── Vertical divider ── */}
          <div className="w-px bg-border shrink-0" />

          {/* ── Right: stats panel ── */}
          <div className="w-36 shrink-0 flex flex-col divide-y">

            {/* Sessions */}
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 px-3 py-3">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <PlayCircleIcon className="size-3" />
                <span className="text-[10px] uppercase tracking-wide font-medium">
                  Sessions
                </span>
              </div>
              <p className="text-lg font-bold tabular-nums leading-none">
                <span>{completed}</span>
                <span className="text-muted-foreground font-normal text-sm">
                  /{total}
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground">completed</p>
            </div>

            {/* Avg Score */}
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 px-3 py-3">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <BarChart2Icon className="size-3" />
                <span className="text-[10px] uppercase tracking-wide font-medium">
                  Avg Score
                </span>
              </div>
              {score != null ? (
                <>
                  <p className={`text-lg font-bold tabular-nums leading-none ${scoreColor(score)}`}>
                    {Math.round(score)}
                    <span className="text-muted-foreground font-normal text-sm">/100</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">overall</p>
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground text-center leading-tight">
                  No sessions yet
                </p>
              )}
            </div>

          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── Data fetching ────────────────────────────────────────────────────────────

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