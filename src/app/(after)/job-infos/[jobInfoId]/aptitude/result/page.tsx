"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AptitudeResultPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { jobInfoId } = useParams<{ jobInfoId: string }>();

  const score = params.get("score");
  const total = params.get("total");

  return (
    <div className="max-w-xl mx-auto p-10 text-center space-y-6">
      <h1 className="text-3xl font-bold">Aptitude Test Result</h1>

      <p className="text-xl">Your Score</p>
      <p className="text-5xl font-bold text-green-600">
        {score} / {total}
      </p>

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/job-infos/${jobInfoId}/aptitude`)}
        >
          Back to History
        </Button>

        <Button
          onClick={() =>
            router.push(`/job-infos/${jobInfoId}/aptitude/start`)
          }
        >
          Start New Aptitude
        </Button>
      </div>
    </div>
  );
}
