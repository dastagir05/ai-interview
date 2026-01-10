"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { JobDetails } from "@/data/type/job";
import { getCurrentUserId } from "@/lib/auth";

export default function CreateInterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string; interviewId: string }>;
}) {
  const router = useRouter();
  const { jobInfoId } = use(params);
  const { interviewId } = use(params);
  const jobId = jobInfoId;
  const [job, setJob] = useState<JobDetails>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    interviewTitle: "",
    focusDomains: [] as string[],
    durationMinutes: 30,
    difficulty: "MEDIUM",
    expectedQuestions: 8,
    includeCodeChallenges: false,
    resumeUrl: "",
    additionalNotes: "",
  });

  const domainOptions = [
    "Foundation",
    "Technical",
    "Practical",
    "Behavioural",
    "System Design",
    "DSA",
    "Microservices",
  ];

  useEffect(() => {
    fetchJobDetails();
  }, []);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/personalJobs/${jobId}`);
      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error("Failed to fetch job:", error);
    }
  };

  const handleDomainToggle = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      focusDomains: prev.focusDomains.includes(domain)
        ? prev.focusDomains.filter((d) => d !== domain)
        : [...prev.focusDomains, domain],
    }));
  };

  const handleSubmit = async () => {
    if (formData.focusDomains.length === 0) {
      alert("Please select at least one focus domain");
      return;
    }

    setLoading(true);

    try {
      const userId = await getCurrentUserId();
      const response = await fetch("/api/practice-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          jobId,
          ...formData,
        }),
      });

      const data = await response.json();

      // const startResponse = await fetch(`/api/practice-interview/start`, {
      //   method: "POST",
      //   // headers: {
      //   //   "Content-Type": "application/json",
      //   //   Authorization: `Bearer ${localStorage.getItem("token")}`,
      //   // },
      //   body: JSON.stringify({
      //     sessionId: data.sessionId,
      //   }),
      // });

      // await startResponse.json();
 //     router.push(`/job-info/${jobInfoId}/interviews/${interviewId}/session/${data.sessionId}`);
      router.push(`/job-info/${jobInfoId}/interviews`);
    } catch (error) {
      console.error("Failed to create interview:", error);
      alert("Failed to create interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Interview</h1>
        <p className="text-muted-foreground mt-2">
          Customize your practice interview for {job.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Configuration</CardTitle>
          <CardDescription>
            Set up your practice interview preferences
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Interview Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Spring Boot REST APIs Practice"
              value={formData.interviewTitle}
              onChange={(e) =>
                setFormData({ ...formData, interviewTitle: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Give your interview a descriptive name
            </p>
          </div>

          <div className="space-y-3">
            <Label>Focus Domains *</Label>
            <p className="text-sm text-muted-foreground">
              Select topics to focus on (select at least one)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {domainOptions.map((domain) => (
                <div key={domain} className="flex items-center space-x-2">
                  <Checkbox
                    id={domain}
                    checked={formData.focusDomains.includes(domain)}
                    onCheckedChange={() => handleDomainToggle(domain)}
                  />
                  <label
                    htmlFor={domain}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {domain}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>
              Interview Duration: {formData.durationMinutes} minutes
            </Label>
            <Slider
              value={[formData.durationMinutes]}
              onValueChange={([value]) =>
                setFormData({ ...formData, durationMinutes: value })
              }
              min={15}
              max={60}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15 min</span>
              <span>30 min</span>
              <span>45 min</span>
              <span>60 min</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                setFormData({ ...formData, difficulty: value })
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Expected Questions: {formData.expectedQuestions}</Label>
            <Slider
              value={[formData.expectedQuestions]}
              onValueChange={([value]) =>
                setFormData({ ...formData, expectedQuestions: value })
              }
              min={5}
              max={15}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 questions</span>
              <span>10 questions</span>
              <span>15 questions</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="codeChallenge"
              checked={formData.includeCodeChallenges}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  includeCodeChallenges: checked === true,
                })
              }
            />
            <label
              htmlFor="codeChallenge"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Include coding challenges (for DSA/Algorithm practice)
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume URL (Optional)</Label>
            <Input
              id="resume"
              type="url"
              placeholder="https://example.com/resume.pdf"
              value={formData.resumeUrl}
              onChange={(e) =>
                setFormData({ ...formData, resumeUrl: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              AI will reference your resume during the interview
            </p>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="notes">Additional Instructions (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Focus on REST API design patterns..."
              value={formData.additionalNotes}
              onChange={(e) =>
                setFormData({ ...formData, additionalNotes: e.target.value })
              }
              rows={3}
            />
          </div> */}

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-semibold">Interview Summary</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Title: {formData.interviewTitle || "N/A"}</li>
              <li>• Duration: {formData.durationMinutes} minutes</li>
              <li>• Expected Questions: ~{formData.expectedQuestions}</li>
              <li>• Difficulty: {formData.difficulty}</li>
              {formData.focusDomains.length > 0 && (
                <li>• Focus: {formData.focusDomains.join(", ")}</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || formData.focusDomains.length === 0}
          className="flex-1"
        >
         {/* {loading ? "Creating..." : "Create & Start Interview"} */}
          {loading ? "Creating..." : "Create Interview"}
        </Button>
      </div>
    </div>
  );
}
