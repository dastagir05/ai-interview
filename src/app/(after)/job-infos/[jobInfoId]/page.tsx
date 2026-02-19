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
import {
  ArrowRightIcon,
  ZapIcon,
  CodeIcon,
  MicIcon,
  FileTextIcon,
  PencilIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { env } from "@/data/env/server";
import { PersonalJobDetails } from "@/data/type/job";
import { cookies } from "next/headers";

const options = [
  {
    label: "Quick Quiz",
    description:
      "Sharpen your problem-solving skills with tailored aptitude tests.",
    href: "aptitude",
    icon: ZapIcon,
  },
  {
    label: "Answer Technical Questions",
    description:
      "Challenge yourself with practice questions tailored to your job description.",
    href: "questions",
    icon: CodeIcon,
  },
  {
    label: "Practice Interviewing",
    description: "Simulate a real interview with AI-powered mock interviews.",
    href: "interviews",
    icon: MicIcon,
  },
  {
    label: "Refine Your Resume",
    description:
      "Get expert feedback on your resume and improve your chances of landing an interview.",
    href: "resume",
    icon: FileTextIcon,
  },
  {
    label: "Update Job Description",
    description: "This should only be used for minor updates.",
    href: "edit",
    icon: PencilIcon,
  },
];

export default async function JobInfoPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  const userId = await requireUserId();
  const jobInfo: PersonalJobDetails = await fetch(
    `${env.BACKEND_URL}/personal-jobs/${jobInfoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  ).then((res) => {
    if (res.status === 404) {
      return null;
    }
    return res.json();
  });

  if (!jobInfo && !userId) {
    return redirect("/upgrade");
  }

  if (!jobInfo) return notFound();

  return (
    <div className="container my-4 space-y-4">
      <BackLink href="/personalJob">Dashboard</BackLink>

      <div className="space-y-6">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              <SuspendedItem
                item={Promise.resolve(jobInfo)}
                fallback={<Skeleton className="w-48" />}
                result={(j) => j.title}
              />
            </h1>
            <div className="flex gap-2 flex-wrap">
              <SuspendedItem
                item={Promise.resolve(jobInfo)}
                fallback={<Skeleton className="w-12" />}
                result={(j) => (
                  <Badge variant="outline" className="font-medium">
                    {j.experienceLevel}
                  </Badge>
                )}
              />
              <SuspendedItem
                item={Promise.resolve(jobInfo)}
                fallback={null}
                result={(j) => {
                  if (!j.skillsRequired || j.skillsRequired.length === 0) {
                    return null;
                  }
                  return (
                    <div className="flex flex-wrap gap-2">
                      {j.skillsRequired.slice(0, 5).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {j.skillsRequired.length > 5 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          +{j.skillsRequired.length - 5} more
                        </Badge>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          </div>
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            <SuspendedItem
              item={Promise.resolve(jobInfo)}
              fallback={<Skeleton className="w-96" />}
              result={(j) => j.description}
            />
          </p>
        </header>

        {/* Divider */}
        <div className="border-t border-border" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 has-hover:*:not-hover:opacity-60">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                className="hover:scale-[1.01] transition-[transform_opacity]"
                href={`/job-infos/${jobInfoId}/${option.href}`}
                key={option.href}
              >
                <Card className="h-full flex items-start justify-between flex-row border-l-[3px] border-l-foreground hover:shadow-md transition-shadow">
                  <CardHeader className="flex-grow flex-row items-start gap-3 space-y-0">
                    {/* Icon + Title pill box */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted border border-border shrink-0">
                      <Icon className="size-4 text-foreground" />
                      <CardTitle className="text-base font-semibold tracking-tight whitespace-nowrap">
                        {option.label}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed pt-2">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 pr-4 pl-0 shrink-0">
                    <ArrowRightIcon className="size-4 text-muted-foreground mt-1" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}