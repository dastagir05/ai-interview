"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { errorToast } from "@/lib/errorToast";

type AptitudeAttempt = {
  attemptId: string;
  score: number;
  total: number;
  finishedAt: string;
  // startedAt: string;
};

export default function AptitudeHistoryPage() {
  const { jobInfoId } = useParams<{ jobInfoId: string }>();
  const router = useRouter();

  const [attempts, setAttempts] = useState<AptitudeAttempt[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<AptitudeAttempt | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(
          `/api/aptitude/history?jobId=${jobInfoId}`
        );
        if (!res.ok) throw new Error("Failed to load history");

        const data = await res.json();
        console.log("attempts",data)
        setAttempts(data);
        setActiveAttempt(data.active || null);
      } catch (e: any) {
        errorToast(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [jobInfoId]);

  if (loading) return <p className="p-6">Loading aptitude history...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Quick Quiz Test</h1>

      {/* ACTIVE ATTEMPT */}
      {activeAttempt && (
        <Card className="border-green-500">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">Active Attempt</p>
              <p className="text-sm text-muted-foreground">
                {/* Started at {new Date(activeAttempt.startedAt).toLocaleString()} */}
              </p>
            </div>
            <Button
              onClick={() =>
                router.push(`/job-infos/${jobInfoId}/aptitude/start`)
              }
            >
              Resume
            </Button>
          </CardContent>
        </Card>
      )}

      {/* START NEW */}
      {!activeAttempt && (
        <Button
          className="w-full"
          onClick={() =>
            router.push(`/job-infos/${jobInfoId}/aptitude/start`)
          }
        >
          Start New Aptitude
        </Button>
      )}

      {/* HISTORY */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Previous Attempts</h2>

        {attempts.length === 0 && (
          <p className="text-muted-foreground">
            No previous attempts yet.
          </p>
        )}

        {attempts.map((a) => (
          <Card key={a.attemptId}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  Score: {a.score} / {a.total}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(a.finishedAt).toLocaleString()}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/job-infos/${jobInfoId}/aptitude/review/${a.attemptId}`
                  )
                }
              >
                Review
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
