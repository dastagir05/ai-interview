import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ArrowRightIcon, PlusIcon, BriefcaseIcon, TrendingUpIcon, ClockIcon, TargetIcon } from "lucide-react";
import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { ExperienceLevel, PersonalJobDetails } from "@/data/type/job";
import { env } from "@/data/env/server";
import { PersonalJobInfoForm } from "@/features/jobInfos/components/PersonalInfoForm";
import { cookies } from "next/headers";

export default async function JobInfos() {
  const userId = await requireUserId();

  let jobInfos: PersonalJobDetails[] = [];
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  try {
    const url = `${env.BACKEND_URL}/personal-jobs/user/${userId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const raw = await res.text();

    if (!res.ok) {
      throw new Error("Failed to fetch");
    }

    jobInfos = JSON.parse(raw);
    console.log("job information", jobInfos);
  } catch (error) {
    console.error("Failed to load job descriptions", error);
    return <div>Failed to load job descriptions</div>;
  }
  
  if (jobInfos.length === 0) {
    return <NoJobInfos />;
  }

  // Calculate insights
  const totalSessions = jobInfos.reduce((sum, job) => sum + (job.interviewSessionsCount || 0), 0);
  const totalJobs = jobInfos.length;
  const activeJobs = jobInfos.filter(job => job.interviewSessionsCount > 0).length;

  return (
    <div className="container my-4">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8 mt-8">
        <div className="flex gap-2 justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold mb-2">
            Select a job description
            </h1>
            <p className="text-muted-foreground">
              Manage your job descriptions and track your interview practice progress
            </p>
          <p>Total Job: {totalJobs}  Active Jobs: {activeJobs}</p>
          </div>
          <Button asChild>
            <Link href="/job-infos/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New
            </Link>
          </Button>
        </div>

        {/* Insights Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-3xl font-bold mt-1">{totalJobs}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <BriefcaseIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-200 dark:border-purple-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Profiles</p>
                  <p className="text-3xl font-bold mt-1">{activeJobs}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUpIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        {jobInfos.map((jobInfo) => (
          <Link
            className="hover:scale-[1.02] transition-[transform_opacity]"
            href={`/job-infos/${jobInfo.id}`}
            key={jobInfo.id}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-bold">{jobInfo.title}</CardTitle>
                  <Badge
                    variant={
                      jobInfo.experienceLevel === "SENIOR"
                        ? "default"
                        : jobInfo.experienceLevel === "MID_LEVEL"
                        ? "secondary"
                        : "outline"
                    }
                    className="ml-2"
                  >
                    {jobInfo.experienceLevel === "MID_LEVEL"
                      ? "MID"
                      : jobInfo.experienceLevel === "JUNIOR"
                      ? "JUNIOR"
                      : jobInfo.experienceLevel}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {jobInfo.description}
                </p>
                
                {/* Skills */}
                {jobInfo.skillsRequired && jobInfo.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {jobInfo.skillsRequired.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {jobInfo.skillsRequired.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{jobInfo.skillsRequired.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TargetIcon className="h-4 w-4" />
                    <span className="font-medium">{jobInfo.interviewSessionsCount || 0}</span>
                    <span>sessions</span>
                  </div>
                  {jobInfo.lastActivityDate && (
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{jobInfo.lastActivityDate}</span>
                    </div>
                  )}
                </div>
                <ArrowRightIcon className="h-5 w-5 text-muted-foreground" />
              </CardFooter>
            </Card>
          </Link>
        ))}

        {/* Add New Card */}
        <Link className="transition-opacity" href="/job-infos/new">
          <Card className="h-full flex items-center justify-center border-dashed border-2 bg-transparent hover:border-primary/50 hover:bg-accent/5 transition-colors shadow-none min-h-[280px]">
            <div className="text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg font-semibold">New Job Profile</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create a new job description to practice for
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function NoJobInfos() {
  return (
    <div className="container my-4 max-w-5xl">
      <div className="text-center mb-8 mt-8">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <BriefcaseIcon className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Welcome to Landr
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          To get started, enter information about the type of job you are wanting
          to apply for. This can be specific information copied directly from a
          job listing or general information such as the tech stack you want to
          work in.
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-accent/5">
          <CardTitle className="text-2xl">Create Your First Job Profile</CardTitle>
          <p className="text-muted-foreground mt-2">
            The more specific you are in the description, the closer the
            test interviews will be to the real thing.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <PersonalJobInfoForm
            jobInfo={{
              title: "",
              description: "",
              experienceLevel: "JUNIOR",
              skillsRequired: [],
              name: "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}