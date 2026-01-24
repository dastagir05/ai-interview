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
import PersonalSkillsRequired from "@/features/jobInfos/components/PersonalSkillsRequired";
import { getCurrentUserId } from "@/lib/auth";
import {toast} from "sonner";

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
  // Add this state at the top with your other useState declarations
  const [skillInput, setSkillInput] = useState("");

  const addCustomSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    
    // Prevent duplicates (case-insensitive check)
    if (formData.focusDomains.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
      alert("This focus area is already added");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      focusDomains: [...prev.focusDomains, trimmed]
    }));
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      focusDomains: prev.focusDomains.filter(s => s !== skill)
    }));
  };
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
      const response = await fetch(`/api/personalJobs/${jobId}/interviews`, {
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

      console.log("new interview create",data)

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        toast.warning("Upgrade your Tier to create more interview")
        setTimeout(() => {
          router.push("/upgrade")
        }, 2000)
        return;
      }
      if (!response.ok) {
        toast.error(
          (data && (data.message || data.error)) ?? "Failed to save job"
        );
        return;
      }

      //handle if response is not ok
      router.push(`/job-infos/${jobInfoId}/interviews`);
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
             <div>
              <Label htmlFor="customSkill" className="text-sm">
                Add Custom Focus Area
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="customSkill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Enter a custom focus area"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addCustomSkill}>
                  Add
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Or select topics to focus on (select at least one)
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

            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-secondary/50 rounded-md min-h-[50px]">
              {formData.focusDomains.length > 0 ? (
                formData.focusDomains.map((skill) => (
                  <div
                    key={skill}
                    className="px-3 py-1 bg-background border rounded-full flex items-center gap-2 text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No focus areas selected yet. Add custom or select from checkboxes above.
                </p>
              )}
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
            <Label htmlFor="resume">Resume URL (Optional | Future)</Label>
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
