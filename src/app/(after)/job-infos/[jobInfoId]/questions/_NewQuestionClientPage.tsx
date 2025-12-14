"use client";

import { BackLink } from "@/components/BackLink";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { formatQuestionDifficulty } from "@/features/questions/formatters";
import { useMemo, useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { errorToast } from "@/lib/errorToast";
import { PersonalJobDetails } from "@/data/type/job";
import { QuestionDifficulty, questionDifficulties } from "@/data/type/question";

type Status = "awaiting-answer" | "awaiting-difficulty" | "init";

export function NewQuestionClientPage({
  jobInfo,
}: {
  jobInfo: Pick<PersonalJobDetails, "id" | "name" | "title">;
}) {
  const [status, setStatus] = useState<Status>("init");
  const [answer, setAnswer] = useState<string>("");

  // Question Generation
  const {
    complete: generateQuestion,
    completion: question,
    setCompletion: setQuestion,
    isLoading: isGeneratingQuestion,
  } = useCompletion({
    api: "/api/ai/questions/generate-question",
    onFinish: () => setStatus("awaiting-answer"),
    onError: (error) => errorToast(error.message),
  });

  // Feedback Generation
  const {
    complete: generateFeedback,
    completion: feedback,
    setCompletion: setFeedback,
    isLoading: isGeneratingFeedback,
  } = useCompletion({
    api: "/api/ai/questions/generate-feedback",
    onFinish: () => setStatus("awaiting-difficulty"),
    onError: (error) => errorToast(error.message),
  });

  //UI
  return (
    <div className="flex flex-col items-center gap-4 w-full mx-w-[2000px] mx-auto h-full">
      <div className="container flex gap-4 mt-4 items-center justify-between">
        <div className="flex basis-0">
          <BackLink href={`/job-infos/${jobInfo.id}`}>{jobInfo.name}</BackLink>
        </div>
        <Controls
          status={status}
          isLoading={isGeneratingQuestion || isGeneratingFeedback}
          disableAnswerButton={!answer.trim() || !question}
          reset={() => {
            setStatus("init");
            setQuestion("");
            setFeedback("");
            setAnswer("");
          }}
          generateQuestion={(difficulty) => {
            setQuestion("");
            setFeedback("");
            setAnswer("");
            generateQuestion(difficulty, {
              body: { jobInfoId: jobInfo.id },
            });
          }}
          generateFeedback={() => {
            if (!question || !answer.trim()) return;

            generateFeedback(answer.trim(), {
              body: {
                question,
                answer: answer.trim(),
                jobInfoId: jobInfo.id,
              },
            });
          }}
        />
        <div className="flex md:block" />
      </div>

      <QuestionContainer
        question={question}
        feedback={feedback}
        answer={answer}
        status={status}
        setAnswer={setAnswer}
      />
    </div>
  );
}

//Question / Answer Layout
function QuestionContainer({
  question,
  feedback,
  answer,
  status,
  setAnswer,
}: {
  question: string | null;
  feedback: string | null;
  answer: string;
  status: Status;
  setAnswer: (value: string) => void;
}) {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-grow border-t">
      <ResizablePanel defaultSize={50} minSize={5}>
        <ResizablePanelGroup
          direction="vertical"
          className="flex-grow min-h-screen"
        >
          <ResizablePanel defaultSize={30} minSize={5}>
            <ScrollArea className="h-full min-w-48 *:h-full">
              {!question ? (
                <p className="text-base md:text-lg flex items-center justify-center h-full p-6">
                  Select a difficulty to start.
                </p>
              ) : (
                <MarkdownRenderer className="p-6">{question}</MarkdownRenderer>
              )}
            </ScrollArea>
          </ResizablePanel>

          {feedback && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={70}>
                <ScrollArea className="h-full min-w-48 *:h-full">
                  <MarkdownRenderer className="p-6">
                    {feedback}
                  </MarkdownRenderer>
                </ScrollArea>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={50} minSize={5}>
        <Textarea
          disabled={status !== "awaiting-answer"}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full h-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset !text-base p-6"
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// Controls

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
          <Button variant="outline" size="sm" onClick={reset}>
            Skip
          </Button>
          <Button
            size="sm"
            onClick={generateFeedback}
            disabled={disableAnswerButton}
          >
            <LoadingSwap isLoading={isLoading}>Answer</LoadingSwap>
          </Button>
        </>
      ) : (
        questionDifficulties.map((difficulty) => (
          <Button
            key={difficulty}
            size="sm"
            onClick={() => generateQuestion(difficulty)}
          >
            {formatQuestionDifficulty(difficulty)}
          </Button>
        ))
      )}
    </div>
  );
}
