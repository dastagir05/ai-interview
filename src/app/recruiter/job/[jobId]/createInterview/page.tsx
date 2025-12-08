"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Wand2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Question } from "@/data/type/job";
// import { Error as AppError } from "@/types/Error";

const BACKEND_URL = "http://localhost:8080/api";

export interface InterviewRound {
  id: string;
  type: InterviewRoundType;
  order: number;
  questions: Question[];
  aiConfig: {
    focusAreas: string;
    difficulty: string;
    duration: number;
  } | null;
}

type InterviewRoundType = "CODING" | "AI_INTERVIEW";
export default function CreateInterviewPage() {
  const params = useParams();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiresResume, setRequiresResume] = useState(false);
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [showRoundOptions, setShowRoundOptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addRound = (type: InterviewRoundType) => {
    const newRound = {
      id: Date.now().toString(),
      type: type,
      order: rounds.length + 1,
      questions: [],
      aiConfig:
        type === "AI_INTERVIEW"
          ? {
              focusAreas: "",
              difficulty: "MEDIUM",
              duration: 30,
            }
          : null,
    };
    setRounds([...rounds, newRound]);
    setShowRoundOptions(false);
  };

  const removeRound = (roundId: string) => {
    setRounds(rounds.filter((r) => r.id !== roundId));
    if (rounds.length === 1) setShowRoundOptions(true);
  };

  const addQuestionToRound = (roundId: string) => {
    setRounds(
      rounds.map((round: InterviewRound) => {
        if (round.id === roundId) {
          return {
            ...round,
            questions: [
              ...round.questions,
              {
                id: Date.now().toString(),
                questionText: "",
                questionType: "TECHNICAL",
                difficultyLevel: "MEDIUM",
                orderInInterview: round.questions.length + 1,
              },
            ],
          };
        }
        return round;
      })
    );
  };

  const updateQuestion = <F extends keyof Question>(
    roundId: string,
    questionId: string,
    field: F,
    value: Question[F]
  ) => {
    setRounds(
      rounds.map((round) => {
        if (round.id === roundId) {
          return {
            ...round,
            questions: round.questions.map((q) =>
              q.id === questionId ? { ...q, [field]: value } : q
            ),
          };
        }
        return round;
      })
    );
  };

  const removeQuestion = (roundId: string, questionId: string) => {
    setRounds(
      rounds.map((round) => {
        if (round.id === roundId) {
          return {
            ...round,
            questions: round.questions.filter((q) => q.id !== questionId),
          };
        }
        return round;
      })
    );
  };

  const generateAIQuestions = async (roundId: string) => {
    try {
      setLoading(true);
      setError("");

      const round = rounds.find((r) => r.id === roundId);

      const response = await fetch(`${BACKEND_URL}/questions/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          roundType: round?.type,
          count: 5,
          difficulty: "MEDIUM",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate questions");

      const generatedQuestions = await response.json();

      setRounds(
        rounds.map((r) => {
          if (r.id === roundId) {
            return {
              ...r,
              questions: [
                ...r.questions,
                ...generatedQuestions.map((q: Question, idx: number) => {
                  const newId = q.id ? q.id : `${Date.now().toString()}-${idx}`;
                  const { id, ...rest } = q;
                  return {
                    id: newId,
                    ...rest,
                    orderInInterview: r.questions.length + idx + 1,
                  };
                }),
              ],
            };
          }
          return r;
        })
      );

      setSuccess("Questions generated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // if (!jobTitle || !jobDescription) {
    //   setError("Please fill in job title and description");
    //   return;
    // }

    if (rounds.length === 0) {
      setError("Please add at least one round (Coding or AI Interview)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const jobId = params.jobId;
      // const jobId = job.id;
      console.log("what in roundsd:", rounds);
      for (const round of rounds) {
        console.log("Creating round:", round, round.type);
        console.log("Order Type: ", round.order);
        console.log("With AI Config:", round.aiConfig);
        console.log("With questions:", round.questions);
        console.log("For Job ID:", jobId);

        const roundResponse = await fetch("/api/rounds/bulk", {
          method: "POST",
          body: JSON.stringify({ jobId, rounds: [...rounds] }),
        });

        // const roundResponse = await fetch(
        //   `${BACKEND_URL}/rounds/${jobId}/bulk`,
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       roundType: round.type,
        //       orderNumber: round.order,
        //       aiConfig: round.type === "AI_INTERVIEW" ? round.aiConfig : null,
        //       codingQuestions: round.type === "CODING" ? round.questions : [],
        //     }),
        //   }
        // );

        if (!roundResponse.ok) throw new Error("Failed to create round");

        const createdRound = await roundResponse.json();

        // if (round.type === "CODING" && round.questions.length > 0) {
        //   for (const question of round.questions) {
        //     await fetch(`${BACKEND_URL}/questions/job/${jobId}/add`, {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `Bearer ${localStorage.getItem("token")}`,
        //       },
        //       body: JSON.stringify({
        //         questionText: question.questionText,
        //         // heading: question.heading,
        //         description: question.questionText,
        //         questionType: question.questionType,
        //         difficultyLevel: question.difficultyLevel,
        //         orderInInterview: question.orderInInterview,
        //         roundId: createdRound.id,
        //       }),
        //     });
        //   }
        // }
      }

      setSuccess("Job created successfully!");
      setTimeout(() => {
        window.location.href = "/recruiter/dashboard";
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Interview</CardTitle>
            <CardDescription>
              Set up a new job position with interview rounds
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Job Basic Info */}
            <div className="space-y-4">
              {/* <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Engineer"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description *</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="mt-2"
                />
              </div> */}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresResume"
                  checked={requiresResume}
                  onCheckedChange={(checked) =>
                    setRequiresResume(checked === true)
                  }
                />
                <Label htmlFor="requiresResume" className="font-normal">
                  Require Resume Analysis (AI will screen resumes before
                  interview)
                </Label>
              </div>
            </div>

            {/* Rounds Section */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Interview Rounds *</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add at least one round (Coding or AI Interview)
                </p>
              </div>

              {showRoundOptions && rounds.length === 0 && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Card
                    className="cursor-pointer hover:bg-accent transition-colors border-2"
                    onClick={() => addRound("CODING")}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Coding Round</CardTitle>
                      <CardDescription>
                        Add coding problems for candidates to solve
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card
                    className="cursor-pointer hover:bg-accent transition-colors border-2"
                    onClick={() => addRound("AI_INTERVIEW")}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        AI Interview Round
                      </CardTitle>
                      <CardDescription>
                        AI-powered conversational interview
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              )}

              {rounds.map((round, roundIndex) => (
                <Card key={round.id} className="mb-6">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Round {roundIndex + 1}:{" "}
                        {round.type === "CODING" ? "Coding" : "AI Interview"}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRound(round.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {round.type === "CODING" ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Add coding problems manually or generate with AI
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => generateAIQuestions(round.id)}
                              disabled={loading}
                              variant="secondary"
                              size="sm"
                            >
                              <Wand2 className="w-4 h-4 mr-2" />
                              Generate
                            </Button>
                            <Button
                              onClick={() => addQuestionToRound(round.id)}
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Question
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {round.questions.map((question, qIndex) => (
                            <Card key={question.id}>
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                  <span className="text-sm font-medium">
                                    Question {qIndex + 1}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeQuestion(round.id, question.id)
                                    }
                                    className="text-destructive hover:text-destructive h-8 w-8"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                  <Textarea
                                    value={question.questionText}
                                    onChange={(e) =>
                                      (question.questionText = e.target.value)
                                    }
                                    placeholder="Describe the coding problem here..."
                                    className="w-full"
                                  />
                                </div>

                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <Select
                                      value={question.questionType}
                                      onValueChange={(value) =>
                                        updateQuestion(
                                          round.id,
                                          question.id,
                                          "questionType",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="TECHNICAL">
                                          Technical
                                        </SelectItem>
                                        <SelectItem value="BEHAVIORAL">
                                          Behavioral
                                        </SelectItem>
                                        <SelectItem value="SITUATIONAL">
                                          Situational
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <Select
                                      value={question.difficultyLevel}
                                      onValueChange={(value) =>
                                        updateQuestion(
                                          round.id,
                                          question.id,
                                          "difficultyLevel",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="EASY">
                                          Easy
                                        </SelectItem>
                                        <SelectItem value="MEDIUM">
                                          Medium
                                        </SelectItem>
                                        <SelectItem value="HARD">
                                          Hard
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          AI will conduct a conversational interview based on
                          job description
                        </p>

                        <div>
                          <Label htmlFor={`focusAreas-${round.id}`}>
                            Focus Areas
                          </Label>
                          <Input
                            id={`focusAreas-${round.id}`}
                            value={round.aiConfig?.focusAreas}
                            onChange={(e) =>
                              setRounds(
                                rounds.map((r) =>
                                  r.id === round.id && r.aiConfig
                                    ? {
                                        ...r,
                                        aiConfig: {
                                          ...r.aiConfig,
                                          focusAreas: e.target.value,
                                        },
                                      }
                                    : r
                                )
                              )
                            }
                            placeholder="e.g., React, System Design, Problem Solving"
                            className="mt-2"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`difficulty-${round.id}`}>
                              Difficulty
                            </Label>
                            <Select
                              value={round.aiConfig?.difficulty}
                              onValueChange={(value) =>
                                setRounds(
                                  rounds.map((r) =>
                                    r.id === round.id && r.aiConfig
                                      ? {
                                          ...r,
                                          aiConfig: {
                                            ...r.aiConfig,
                                            difficulty: value,
                                          },
                                        }
                                      : r
                                  )
                                )
                              }
                            >
                              <SelectTrigger
                                id={`difficulty-${round.id}`}
                                className="mt-2"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EASY">Easy</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HARD">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`duration-${round.id}`}>
                              Duration (minutes)
                            </Label>
                            <Input
                              id={`duration-${round.id}`}
                              type="number"
                              value={round.aiConfig?.duration}
                              onChange={(e) =>
                                setRounds(
                                  rounds.map((r) =>
                                    r.id === round.id && r.aiConfig
                                      ? {
                                          ...r,
                                          aiConfig: {
                                            ...r.aiConfig,
                                            duration: parseInt(e.target.value),
                                          },
                                        }
                                      : r
                                  )
                                )
                              }
                              min="10"
                              max="60"
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {rounds.length > 0 && rounds.length < 3 && (
                <Button
                  variant="outline"
                  onClick={() => setShowRoundOptions(!showRoundOptions)}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Round
                </Button>
              )}

              {showRoundOptions && rounds.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button variant="outline" onClick={() => addRound("CODING")}>
                    + Coding Round
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addRound("AI_INTERVIEW")}
                  >
                    + AI Interview
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || rounds.length === 0}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Interview Job"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
