"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter, useParams } from "next/navigation";
import { errorToast } from "@/lib/errorToast";
import { ClockIcon, CheckCircleIcon } from "lucide-react";

type AptitudeQuestion = {
  id: string;
  question: string;
  options: string[];
};

export default function AptitudeTestPage() {
  const { jobInfoId } = useParams<{ jobInfoId: string }>();
  const jobId = jobInfoId;
  const router = useRouter();

  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (timeLeft === 0) submitTest();
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/aptitude/start?jobId=${jobId}`);
        if (!res.ok) throw new Error("Failed to load aptitude test");
        const data = await res.json();
        setAttemptId(data.attemptId);
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(-1));
      } catch (e: any) {
        errorToast(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jobId]);

  function selectOption(index: number) {
    const copy = [...answers];
    copy[current] = index;
    setAnswers(copy);
  }

  async function submitTest() {
    if (!attemptId) return;
    try {
      const res = await fetch(`/api/aptitude/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers }),
      });
      if (res.status === 500 || res.status === 503) {
        errorToast("AI or server is down, try later");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Submission failed");
      const result = await res.json();
      router.push(
        `/job-infos/${jobId}/aptitude/result?score=${result.score}&total=${result.total}&attemptId=${attemptId}`
      );
    } catch (e: any) {
      errorToast(e.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Generating your aptitude test...</p>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const answeredCount = answers.filter((a) => a !== -1).length;
  const progressPercent = ((current + 1) / questions.length) * 100;
  const isTimeLow = timeLeft < 60;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Aptitude Test</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {answeredCount} of {questions.length} answered
            </p>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-sm font-semibold ${
              isTimeLow
                ? "border-destructive text-destructive bg-destructive/5"
                : "border-border text-foreground bg-background"
            }`}
          >
            <ClockIcon className="size-4" />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-2">
          <CardContent className="p-6 space-y-6">
            <p className="text-base font-medium leading-relaxed">{q.question}</p>

            <div className="grid gap-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-between gap-3
                    ${
                      answers[current] === i
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:border-foreground/40 hover:bg-muted/50"
                    }`}
                >
                  <span>{opt}</span>
                  {answers[current] === i && (
                    <CheckCircleIcon className="size-4 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question dots navigator */}
        <div className="flex justify-center gap-2 flex-wrap">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-8 h-8 rounded-full text-xs font-semibold border-2 transition-all
                ${
                  i === current
                    ? "border-foreground bg-foreground text-background"
                    : answers[i] !== -1
                    ? "border-foreground bg-foreground/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/50"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button
            disabled={current === 0}
            variant="outline"
            onClick={() => setCurrent((c) => c - 1)}
          >
            Previous
          </Button>

          {current === questions.length - 1 ? (
            <Button onClick={submitTest} className="px-8">
              Submit Test
            </Button>
          ) : (
            <Button onClick={() => setCurrent((c) => c + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}