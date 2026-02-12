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
import { useState } from "react";
import { errorToast } from "@/lib/errorToast";
import { PersonalJobDetails } from "@/data/type/job";
import { QuestionDifficulty, questionDifficulties } from "@/data/type/question";
import { CodeEditor } from "@/components/CodeEditor";

type Status = "awaiting-answer" | "awaiting-difficulty" | "init";

export type GeneratedQuestion = {
  question: string;      
  questionType: string;
  language: string;
};

export function NewQuestionClientPage({
  jobInfo,
}: {
  jobInfo: Pick<PersonalJobDetails, "id" | "name" | "title">;
}) {
  const [status, setStatus] = useState<Status>("init");
  const [answer, setAnswer] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState("java");

  // Generate question
  const handleGenerateQuestion = async (difficulty: QuestionDifficulty) => {
    setLoading(true);
    setQuestion("");
    setFeedback("");
    setAnswer("");
    setStatus("init");

    try {
      const res = await fetch("/api/question/generateTechnicalQuestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobInfoId: jobInfo.id, difficulty }),
      });
       console.log("res from gene question", res)
      if (!res.ok) throw new Error("Failed to generate question");

      const text : GeneratedQuestion= await res.json();
      setLanguage(text.language)
      console.log("text res of gene ques in page.tsx", text, text.question)
      console.log("text res ", text.language, text.questionType)
      setQuestion(text.question);
      setStatus("awaiting-answer");
    } catch (err: any) {
      errorToast(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Submit answer and get feedback
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
        }),
      });

      if (!res.ok) throw new Error("Failed to get feedback");
      const text = await res.text(); 
      console.log("res in question page", text);
      setFeedback(text);
      setStatus("awaiting-difficulty");
    } catch (err: any) {
      errorToast(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };  

  //UI
  return (
    <div className="flex flex-col items-center gap-4 w-full mx-w-[2000px] mx-auto h-full">
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
  language,
}:{
  question: string | null;
  feedback: string | null;
  answer: string;
  status: Status;
  language: string;
  setAnswer: (value: string) => void;
})
{
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
      <CodeEditor
        value={answer}
        onChange={setAnswer}
        language={language}
        readOnly={status !== "awaiting-answer"}
      />
        {/* <Textarea
          disabled={status !== "awaiting-answer"}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full h-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset !text-base p-6"
        /> */}
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
            {/* <LoadingSwap isLoading={isLoading}>Answer</LoadingSwap> */}
            Answer
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
