"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon, RotateCcwIcon, ListIcon, TrophyIcon } from "lucide-react";

export default function AptitudeResultPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { jobInfoId } = useParams<{ jobInfoId: string }>();

  const score = Number(params.get("score") ?? 0);
  const total = Number(params.get("total") ?? 0);
  const attemId = params.get("attemptId");

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  // Feedback based on score
  const feedback =
    percent >= 80
      ? { label: "Excellent", message: "Outstanding performance! You have a strong grasp of the material." }
      : percent >= 60
      ? { label: "Good", message: "Solid effort. Review the questions you missed to push higher." }
      : percent >= 40
      ? { label: "Fair", message: "You're getting there. Focus on the topics where you struggled." }
      : { label: "Needs Work", message: "Don't give up — review the material and try again." };

  // Circle progress ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (percent / 100) * circumference;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="container mx-auto px-6 py-10 max-w-2xl space-y-6">

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Quiz Complete</h1>
          <p className="text-sm text-muted-foreground">Here's how you did</p>
        </div>

        {/* Score Card */}
        <Card className="border-2">
          <CardContent className="p-8 flex flex-col items-center gap-4">

            {/* Circular progress */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                {/* Background ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="10"
                />
                {/* Progress ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  className="stroke-foreground transition-all duration-700"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums">{percent}%</span>
                <span className="text-xs text-muted-foreground">{score} / {total}</span>
              </div>
            </div>

            {/* Feedback label + message */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted text-sm font-semibold">
                <TrophyIcon className="size-3.5" />
                {feedback.label}
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {feedback.message}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Correct</p>
              <p className="text-2xl font-bold">{score}</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Incorrect</p>
              <p className="text-2xl font-bold">{total - score}</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold">{total}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/job-infos/${jobInfoId}/aptitude`)}
          >
            <ListIcon className="size-4 mr-2" />
            Back to History
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              router.push(`/job-infos/${jobInfoId}/aptitude/review/${attemId}`)
            }
          >
            <ArrowRightIcon className="size-4 mr-2" />
            Review Answers
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push(`/job-infos/${jobInfoId}/aptitude/start`)}
          >
            <RotateCcwIcon className="size-4 mr-2" />
            Try Again
          </Button>
        </div>

      </div>
    </div>
  );
}