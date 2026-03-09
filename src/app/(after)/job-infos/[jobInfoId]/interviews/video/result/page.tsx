"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { ArrowLeft, RotateCcw, VideoIcon, Loader2 } from "lucide-react";
import type { VideoInterviewProcessResponse } from "@/data/type/session";

function ScoreItem({ label, score }: { label: string; score?: number }) {
  const percentage = Math.round(score ?? 0);
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${getColor(percentage)}`}>{percentage}</p>
    </div>
  );
}

export default function VideoInterviewResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobInfoId: string }>;
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { jobInfoId } = use(params);
  const { submissionId } = use(searchParams);
  const router = useRouter();
  const [result, setResult] = useState<VideoInterviewProcessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) {
      setError("Missing submission");
      setLoading(false);
      return;
    }
    fetch(`/api/personalJobs/${jobInfoId}/video-interview/submissions/${submissionId}`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load result");
        return r.json();
      })
      .then((data) => {
        setResult(data);
      })
      .catch(() => setError("Could not load feedback"))
      .finally(() => setLoading(false));
  }, [jobInfoId, submissionId]);

  if (loading) {
    return (
      <div className="container py-8 flex flex-col items-center gap-4">
        <JobInfoBackLink jobInfoId={jobInfoId} />
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading your feedback...</p>
      </div>
    );
  }
  if (error || !result) {
    return (
      <div className="container py-8">
        <JobInfoBackLink jobInfoId={jobInfoId} />
        <p className="text-destructive mt-4">{error ?? "No result"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/job-infos/${jobInfoId}/interviews/video`}>Back to Video Interview</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <JobInfoBackLink jobInfoId={jobInfoId} />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mt-4">Video Interview Completed</h1>
          <p className="text-muted-foreground mt-2">Feedback based on your recorded answer</p>
        </div>

        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Overall Performance</span>
              <Badge className="text-2xl px-4 py-2">
                {Math.round(result.overallScore ?? 0)}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreItem label="Technical" score={result.technicalScore ?? 0} />
              <ScoreItem label="Communication" score={result.communicationScore ?? 0} />
              <ScoreItem label="Confidence" score={result.confidenceScore ?? 0} />
              <ScoreItem label="Problem Solving" score={result.problemSolvingScore ?? 0} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 mb-6">
          {result.strengths && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg text-green-700">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{result.strengths}</p>
              </CardContent>
            </Card>
          )}
          {result.weaknesses && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-700">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{result.weaknesses}</p>
              </CardContent>
            </Card>
          )}
          {result.recommendations && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{result.recommendations}</p>
              </CardContent>
            </Card>
          )}
          {result.feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detailed Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{result.feedback}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {result.videoReplayUrl && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <VideoIcon className="size-5" />
                Replay your answer (Pro)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={result.videoReplayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Watch your recorded video
              </a>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href={`/job-infos/${jobInfoId}/interviews/video`} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Video Interview
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href={`/job-infos/${jobInfoId}/interviews/video`}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Record another
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
