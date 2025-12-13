import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { env } from "@/data/env/server";
import { SessionCardDTO } from "@/data/type/interview";
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { getCurrentUserId, requireUserId } from "@/lib/auth";
import { formatDateTime } from "@/lib/formatters";
import { ArrowRightIcon, Loader2Icon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
  const userId = await requireUserId();

  const interviews = await getInterviews(jobInfoId, userId);
  if (interviews.length === 0) {
    return redirect(`/job-infos/${jobInfoId}/interviews/new`);
  }
  return (
    <div className="space-y-6 w-full">
      <div className="flex gap-2 justify-between">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">Interviews</h1>
        <Button asChild>
          <Link href={`/job-infos/${jobInfoId}/interviews/new`}>
            <PlusIcon />
            New Interview
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        {interviews.map((interview: SessionCardDTO) => (
          <Link
            className="hover:scale-[1.02] transition-[transform_opacity]"
            href={`/job-infos/${jobInfoId}/interviews/${interview.sessionId}`}
            key={interview.sessionId}
          >
            <Card className="h-full">
              <div className="flex items-center justify-between h-full">
                <CardHeader className="gap-1 flex-grow">
                  <CardTitle className="text-lg">
                    {/* {formatDateTime(interview.createdAt)} */}
                    {interview.interviewTitle}
                    <span className="block text-sm">{interview.createdAt}</span>
                  </CardTitle>
                  <CardDescription>{interview.durationMinutes}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

async function getInterviews(jobInfoId: string, userId: string) {
  try {
    //const userId = await getCurrentUserId(); // Or get from auth context
    const response = await fetch(
      `${env.BACKEND_URL}/practice-interview/user/${userId}/job/${jobInfoId}/sessions`
      // {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("token")}`,
      //   },
      // }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
  } finally {
    console.log("Fetch sessions attempt finished.");
  }
  return [];
}
