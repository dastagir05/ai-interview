"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { errorToast } from "@/lib/errorToast";

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
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [loading, setLoading] = useState(true);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (timeLeft === 0) submitTest();

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ---------------- LOAD QUESTIONS ---------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/aptitude/start?jobId=${jobId}`);
        if (!res.ok) throw new Error("Failed to load aptitude test");

        const data = await res.json();
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
    try {
      const res = await fetch(`/api/aptitude/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          answers,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      const result = await res.json();
      router.push(`/job-infos/${jobId}/aptitude/result?score=${result.score}`);
    } catch (e: any) {
      errorToast(e.message);
    }
  }

  if (loading) return <p className="p-6">Loading aptitude test...</p>;

  const q = questions[current];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Aptitude Test</h2>
        <p className="font-mono">
          ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="font-medium">
            Question {current + 1} / {questions.length}
          </p>

          <p className="text-lg">{q.question}</p>

          <div className="grid gap-2">
            {q.options.map((opt, i) => (
              <Button
                key={i}
                variant={answers[current] === i ? "default" : "outline"}
                onClick={() => selectOption(i)}
                className="justify-start"
              >
                {opt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          disabled={current === 0}
          variant="outline"
          onClick={() => setCurrent((c) => c - 1)}
        >
          Previous
        </Button>

        {current === questions.length - 1 ? (
          <Button onClick={submitTest}>Submit Test</Button>
        ) : (
          <Button onClick={() => setCurrent((c) => c + 1)}>Next</Button>
        )}
      </div>
    </div>
  );
}
