"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { errorToast } from "@/lib/errorToast";
import {
  PlusIcon,
  TrophyIcon,
  ClockIcon,
  ArrowRightIcon,
  TrendingDownIcon,
  BarChart2Icon,
  Layers,
} from "lucide-react";

type AptitudeAttempt = {
  attemptId: string;
  score: number;
  total: number;
  finishedAt: string;
};

export default function AptitudeHistoryPage() {
  const { jobInfoId } = useParams<{ jobInfoId: string }>();
  const router = useRouter();

  const [attempts, setAttempts] = useState<AptitudeAttempt[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<AptitudeAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/aptitude/history?jobId=${jobInfoId}`);
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted border-t-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading history...</p>
        </div>
      </div>
    );
  }

  const percents = attempts.map((a) => Math.round((a.score / a.total) * 100));
  const bestScore = attempts.length ? Math.max(...percents) : null;
  const lowestScore = attempts.length ? Math.min(...percents) : null;
  const avgScore = attempts.length
    ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
    : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="container mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quick Quiz</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {attempts.length} attempt{attempts.length !== 1 ? "s" : ""} completed
            </p>
          </div>
          <Button onClick={() => router.push(`/job-infos/${jobInfoId}/aptitude/start`)}>
            <PlusIcon className="size-4 mr-2" />
            New Attempt
          </Button>
        </div>

        {/* 4 Stat Cards */}
        {attempts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted border border-border shrink-0">
                  <TrophyIcon className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Highest</p>
                  <p className="text-xl font-bold">{bestScore}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted border border-border shrink-0">
                  <BarChart2Icon className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Average</p>
                  <p className="text-xl font-bold">{avgScore}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted border border-border shrink-0">
                  <TrendingDownIcon className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lowest</p>
                  <p className="text-xl font-bold">{lowestScore}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted border border-border shrink-0">
                  <Layers className="size-4 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{attempts.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active attempt banner */}
        {activeAttempt && (
          <Card className="border-2 border-foreground">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Active Attempt</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You have an unfinished quiz
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => router.push(`/job-infos/${jobInfoId}/aptitude/start`)}
              >
                Resume
              </Button>
            </CardContent>
          </Card>
        )}

        {/* History Table */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Previous Attempts
          </h2>

          {attempts.length === 0 ? (
            <Card className="border border-dashed bg-transparent shadow-none">
              <CardContent className="p-10 text-center">
                <div className="p-3 rounded-full bg-muted border border-border w-fit mx-auto mb-3">
                  <TrophyIcon className="size-5 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">No attempts yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start your first quiz to see your history here
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border overflow-hidden">
              {/* Table Header — 5 columns */}
              <div className="grid grid-cols-5 px-4 py-2.5 border-b bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>#</span>
                <span>Score</span>
                <span>Percentage</span>
                <span>Date & Time</span>
                <span className="text-right">Action</span>
              </div>

              {attempts.map((a, index) => {
                const percent = Math.round((a.score / a.total) * 100);
                return (
                  <div
                    key={a.attemptId}
                    className={`grid grid-cols-5 px-4 py-3.5 items-center text-lg hover:bg-muted/30 transition-colors ${
                      index !== attempts.length - 1 ? "border-b" : ""
                    }`}
                  >
                    {/* # — simple 1,2,3,4 */}
                    <span className="text-muted-foreground font-bold text-lg">
                      {index + 1}
                    </span>

                    {/* Score only */}
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{a.score}</span>
                      <span className="text-muted-foreground">/ {a.total}</span>
                    </div>

                    {/* Percentage — own column */}
                    <span>
                      <span className="font-semibold px-2 py-0.5 rounded">
                        {percent}%
                      </span>
                    </span>

                    {/* Date & Time */}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ClockIcon className="size-3 shrink-0" />
                      <span className="text-base">
                        {new Date(a.finishedAt).toLocaleDateString()}{" "}
                        {new Date(a.finishedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/job-infos/${jobInfoId}/aptitude/review/${a.attemptId}`
                          )
                        }
                      >
                        Review
                        <ArrowRightIcon className="size-3 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}