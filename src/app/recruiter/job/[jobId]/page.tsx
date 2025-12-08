import { BackLink } from "@/components/BackLink";
import { Skeleton } from "@/components/Skeleton";
import { SuspendedItem } from "@/components/SuspendedItem";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { env } from "@/data/env/server";
import { toast } from "sonner";
import RoundsPage from "@/components/recruiter/RoundsPage";

const options = [
  // {
  //   label: "Set Interview Questions",
  //   description:
  //     "Choose or create questions to ask candidates during the interview.",
  //   href: "questions",
  // },
  // {
  //   label: "Generate Questions for Interview",
  //   description:
  //     "Use AI to generate tailored interview questions for this job.",
  //   href: "interviews",
  // },
  {
    label: "Manage Interview Rounds",
    description: "Define and organize the interview rounds for this job.",
    href: "roundsDetails",
  },
  {
    label: "Create Interview",
    description: "Schedule and set up an interview session for candidates.",
    href: "createInterview",
  },
  {
    label: "Interview results",
    description: "This should only be used for minor updates.",
    href: "Results",
  },
  {
    label: "Edit Job Description",
    description: "Make changes to the job description and requirements. ",
    href: "edit",
  },
];

export default async function JobInfoPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  console.log("jobId:", jobId);

  let jobInfo;
  try {
    jobInfo = await fetch(`${env.BACKEND_URL}/jobs/${jobId}`).then((res) =>
      res.json()
    );
    //   console.log("jobInfos:", jobInfos);
  } catch (error) {
    toast.error("Failed to load job descriptions");
    return null;
  }

  if (!jobInfo) return notFound();

  return (
    <div className="container my-4 space-y-4">
      <BackLink href="/dashboard">Dashboard</BackLink>

      <div className="space-y-6">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl">
              <SuspendedItem
                item={Promise.resolve(jobInfo)}
                fallback={<Skeleton className="w-48" />}
                result={(j) => j.title}
              />
            </h1>
            <div className="flex gap-2">
              <SuspendedItem
                item={Promise.resolve(jobInfo)}
                fallback={<Skeleton className="w-12" />}
                result={(j) => (
                  <Badge variant="secondary">
                    {/* {formatExperienceLevel(j.experienceLevel)} */}
                    {j.experienceLevel}
                  </Badge>
                )}
              />
              <SuspendedItem
                item={Promise.resolve(jobInfo)}
                fallback={null}
                result={(j) => {
                  return (
                    j.skillsRequired && (
                      <Badge variant="secondary">{j.skillsRequired}</Badge>
                    )
                  );
                }}
              />
            </div>
          </div>
          <p className="text-muted-foreground line-clamp-3">
            <SuspendedItem
              item={Promise.resolve(jobInfo)}
              fallback={<Skeleton className="w-96" />}
              result={(j) => j.description}
            />
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
          {options.map((option) => (
            <Link
              className="hover:scale-[1.02] transition-[transform_opacity]"
              href={`/recruiter/job/${jobId}/${option.href}`}
              key={option.href}
            >
              <Card className="h-full flex items-start justify-between flex-row">
                <CardHeader className="flex-grow">
                  <CardTitle>{option.label}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
