import { env } from "@/data/env/server";
import { Loader2Icon } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NewQuestionClientPage } from "./_NewQuestionClientPage";
import { requireUserId } from "@/lib/auth";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2Icon className="animate-spin size-24" />
        </div>
      }
    >
      <SuspendedComponent jobInfoId={jobInfoId} />
    </Suspense>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  const userId = await requireUserId();

  // if (!(await canCreateQuestion())) return redirect("/upgrade");

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return <NewQuestionClientPage jobInfo={jobInfo} />;
}

async function getJobInfo(id: string, userId: string) {
  const res = await fetch(`${env.BACKEND_URL}/personal-jobs/${id}`).then(
    (res) => res.json()
  );
  return res;
}
