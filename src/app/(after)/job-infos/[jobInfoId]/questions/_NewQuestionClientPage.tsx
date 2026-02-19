"use client";

import { BackLink } from "@/components/BackLink";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatQuestionDifficulty } from "@/features/questions/formatters";
import { useState } from "react";
import { errorToast } from "@/lib/errorToast";
import { PersonalJobDetails } from "@/data/type/job";
import { QuestionDifficulty, questionDifficulties } from "@/data/type/question";
import { CodeEditor } from "@/components/CodeEditor";
import { Badge } from "@/components/ui/badge";

type Status = "awaiting-answer" | "awaiting-difficulty" | "init";

export type GeneratedQuestion = {
  question: string;
  questionType: string;
  language: string;
  boilerplate: string;
};

export function NewQuestionClientPage({
  jobInfo,
}: {
  jobInfo: Pick<PersonalJobDetails, "id" | "name" | "title">;
}) {
  const [status, setStatus] = useState<Status>("init");
  const [answer, setAnswer] = useState<string>("");
  const [boilerplate, setBoilerplate] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState("java");
  const [questionType, setQuestionType] = useState<string>("");
  const [currentDifficulty, setCurrentDifficulty] = useState<QuestionDifficulty | null>(null);

  const handleGenerateQuestion = async (difficulty: QuestionDifficulty) => {
    setLoading(true);
    setQuestion("");
    setFeedback("");
    setAnswer("");
    setStatus("init");
    setCurrentDifficulty(difficulty);

    try {
      const res = await fetch("/api/question/generateTechnicalQuestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobInfoId: jobInfo.id, difficulty }),
      });

      if (!res.ok) throw new Error("Failed to generate question");

      const text: GeneratedQuestion = await res.json();
      setLanguage(text.language);
      setQuestionType(text.questionType);
      setQuestion(text.question);
      // ✅ Pre-fill editor with boilerplate
      setAnswer(text.boilerplate ?? "");
      setBoilerplate(text.boilerplate ?? "");
      setStatus("awaiting-answer");
    } catch (err: any) {
      errorToast(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!question || !answer.trim()) return;

    setLoading(true);
    setFeedback("");

    try {
      const res = await fetch("/api/question/submitTechnicalQuestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobInfoId: jobInfo.id,
          question,
          answer: answer.trim(),
          boilerplate,
        }),
      });

      if (!res.ok) throw new Error("Failed to get feedback");
      const text = await res.text();
      setFeedback(text);
      setStatus("awaiting-difficulty");
    } catch (err: any) {
      errorToast(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full mx-auto h-full">
      <div className="container flex gap-4 mt-4 items-center justify-between">
        <div className="flex basis-0">
          <BackLink href={`/job-infos/${jobInfo.id}`}>{jobInfo.name}</BackLink>
        </div>
        <Controls
          status={status}
          isLoading={loading}
          disableAnswerButton={!answer.trim() || !question}
          reset={() => {
            setStatus("init");
            setQuestion("");
            setFeedback("");
            setAnswer("");
            setCurrentDifficulty(null);
          }}
          generateQuestion={handleGenerateQuestion}
          generateFeedback={handleSubmitAnswer}
        />
        <div className="flex md:block" />
      </div>

      <QuestionContainer
        question={question}
        feedback={feedback}
        answer={answer}
        status={status}
        setAnswer={setAnswer}
        language={language}
        questionType={questionType}
        difficulty={currentDifficulty}
      />
    </div>
  );
}

function QuestionContainer({
  question,
  feedback,
  answer,
  status,
  setAnswer,
  language,
  questionType,
  difficulty,
}: {
  question: string | null;
  feedback: string | null;
  answer: string;
  status: Status;
  language: string;
  questionType: string;
  difficulty: QuestionDifficulty | null;
  setAnswer: (value: string) => void;
}) {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-grow border-t">
      <ResizablePanel defaultSize={50} minSize={5}>
        <ResizablePanelGroup direction="vertical" className="flex-grow min-h-screen">
          <ResizablePanel defaultSize={feedback ? 35 : 100} minSize={5}>
            <ScrollArea className="h-full min-w-48 *:h-full">
              {!question ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                  
                  <p className="text-base font-medium">Select a difficulty to start</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Choose Easy, Medium, or Hard above to get a technical question tailored to your job description.
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {/* Question metadata */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {difficulty && (
                      <Badge variant="outline" className="text-xs font-medium capitalize">
                        {formatQuestionDifficulty(difficulty)}
                      </Badge>
                    )}
                    {questionType && (
                      <Badge variant="secondary" className="text-xs font-medium">
                        {questionType}
                      </Badge>
                    )}
                    {language && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {language}
                      </Badge>
                    )}
                  </div>

                  {/* Question text */}
                  <MarkdownRenderer>{question}</MarkdownRenderer>
                </div>
              )}
            </ScrollArea>
          </ResizablePanel>

          {/* Feedback panel appears below question after submit */}
          {feedback && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={65}>
                <ScrollArea className="h-full min-w-48 *:h-full">
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <span className="text-sm font-semibold">AI Feedback</span>
                    </div>
                    <MarkdownRenderer>{feedback}</MarkdownRenderer>
                  </div>
                </ScrollArea>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Code editor — right panel */}
      <ResizablePanel defaultSize={50} minSize={5}>
        <CodeEditor
          value={answer}
          onChange={setAnswer}
          language={language}
          readOnly={status !== "awaiting-answer"}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function Controls({
  status,
  isLoading,
  disableAnswerButton,
  generateQuestion,
  generateFeedback,
  reset,
}: {
  status: Status;
  isLoading: boolean;
  disableAnswerButton: boolean;
  generateQuestion: (difficulty: QuestionDifficulty) => void;
  generateFeedback: () => void;
  reset: () => void;
}) {
  return (
    <div className="flex gap-2">
      {status === "awaiting-answer" ? (
        <>
          <Button variant="outline" size="sm" onClick={reset} disabled={isLoading}>
            Skip
          </Button>
          <Button
            size="sm"
            onClick={generateFeedback}
            disabled={disableAnswerButton || isLoading}
          >
            {isLoading ? "Evaluating..." : "Answer"}
          </Button>
        </>
      ) : (
        questionDifficulties.map((difficulty) => (
          <Button
            key={difficulty}
            size="sm"
            variant={status === "awaiting-difficulty" ? "outline" : "default"}
            onClick={() => generateQuestion(difficulty)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : formatQuestionDifficulty(difficulty)}
          </Button>
        ))
      )}
    </div>
  );
}