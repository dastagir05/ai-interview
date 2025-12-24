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
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { env } from "@/data/env/server";
import { PersonalJobDetails } from "@/data/type/job";

const options = [
  {
    label: "Aptitude Practice",
    description:
      "Sharpen your problem-solving skills with tailored aptitude tests.",
    href: "aptitude",
  },
  {
    label: "Answer Technical Questions",
    description:
      "Challenge yourself with practice questions tailored to your job description.",
    href: "questions",
  },
  {
    label: "Practice Interviewing",
    description: "Simulate a real interview with AI-powered mock interviews.",
    href: "interviews",
  },
  {
    label: "Refine Your Resume",
    description:
      "Get expert feedback on your resume and improve your chances of landing an interview.",
    href: "resume",
  },
  {
    label: "Update Job Description",
    description: "This should only be used for minor updates.",
    href: "edit",
  },
];

export default async function JobInfoPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  const userId = await requireUserId();
  const jobInfo: PersonalJobDetails = await fetch(
    `${env.BACKEND_URL}/personal-jobs/${jobInfoId}`
  ).then((res) => {
    if (res.status === 404) {
      return null;
    }
    return res.json();
  });

  if (!jobInfo && !userId) {
    console.log("jobInfo", jobInfo, "userId", userId)
    return redirect("/upgrade");
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
                  <Badge variant="secondary">{j.experienceLevel}</Badge>
                )}
              />
              <SuspendedItem
                item={Promise.resolve(jobInfo)}
                fallback={null}
                result={(j) => {
                  return (
                    j.title && (
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
              href={`/job-infos/${jobInfoId}/${option.href}`}
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
