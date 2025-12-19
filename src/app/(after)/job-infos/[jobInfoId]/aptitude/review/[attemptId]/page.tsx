"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { errorToast } from "@/lib/errorToast";

type ReviewItem = {
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number;
};

export default function AptitudeReviewPage() {
  const { attemptId, jobInfoId } = useParams<{
    attemptId: string;
    jobInfoId: string;
  }>();

  const router = useRouter();
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReview() {
      try {
        const res = await fetch(`/api/aptitude/review?attemptId=${attemptId}`);
        if (!res.ok) throw new Error("Failed to load review");

        const data = await res.json();
        console.log("review", data)
        setReview(data);
      } catch (e: any) {
        errorToast(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadReview();
  }, [attemptId]);

  if (loading) {
    return <p className="p-6">Loading review...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Aptitude Review</h1>

        <Button
          variant="outline"
          onClick={() =>
            router.push(`/job-infos/${jobInfoId}/aptitude`)
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Button>
      </div>

      {/* Questions */}
      {review.map((item, idx) => {
        const isCorrect = item.selectedIndex === item.correctIndex;

        return (
          <Card key={idx}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">
                  Q{idx + 1}. {item.question}
                </p>

                {isCorrect ? (
                  <CheckCircle className="text-green-600" />
                ) : (
                  <XCircle className="text-red-600" />
                )}
              </div>

              <div className="grid gap-2">
                {item.options.map((opt, i) => {
                  const isSelected = i === item.selectedIndex;
                  const isAnswer = i === item.correctIndex;

                  let variant: "outline" | "default" = "outline";
                  let className = "";

                  if (isAnswer) {
                    variant = "default";
                    className = "bg-green-600 hover:bg-green-600";
                  } else if (isSelected && !isAnswer) {
                    variant = "default";
                    className = "bg-red-500 hover:bg-red-500";
                  }

                  return (
                    <Button
                      key={i}
                      variant={variant}
                      className={`justify-start cursor-default ${className}`}
                      disabled
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
