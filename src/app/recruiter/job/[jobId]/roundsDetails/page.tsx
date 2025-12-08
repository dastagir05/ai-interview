import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { env } from "@/data/env/server";

export default async function RoundsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  const rounds = await fetch(`${env.BACKEND_URL}/rounds/${jobId}`, {
    cache: "no-store",
  }).then((res) => res.json());

  return (
    <div className="container my-6 space-y-4">
      <h1 className="text-3xl font-semibold">Interview Rounds</h1>

      <div className="space-y-6">
        {rounds.map((round: any) => (
          <Card key={round.id} className="p-4 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  Round {round.orderNumber}
                </CardTitle>

                <Badge variant="outline">{round.roundType}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* AI INTERVIEW ROUND */}
              {round.roundType === "AI_INTERVIEW" && (
                <div className="p-4 rounded-xl bg-secondary/20 border">
                  <p>
                    <strong>Focus Areas:</strong> {round.aiConfig?.focusAreas}
                  </p>
                  <p>
                    <strong>Difficulty:</strong> {round.aiConfig?.difficulty}
                  </p>
                  {round.aiConfig?.durationMinutes && (
                    <p>
                      <strong>Duration:</strong>{" "}
                      {round.aiConfig.durationMinutes} min
                    </p>
                  )}
                </div>
              )}

              {/* CODING ROUND */}
              {round.roundType === "CODING" && (
                <div className="p-4 rounded-xl bg-secondary/20 border space-y-2">
                  <p className="font-medium">
                    Coding Questions ({round.questionCount})
                  </p>

                  <div className="space-y-3">
                    {round.codingQuestions.map((q: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border bg-background"
                      >
                        <div className="font-semibold">
                          {q.orderInInterview}. {q.questionText}
                        </div>

                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{q.questionType}</Badge>
                          <Badge variant="secondary">{q.difficultyLevel}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
