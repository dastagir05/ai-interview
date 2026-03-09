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
} from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { env } from "@/data/env/server";
import { PersonalJobDetails } from "@/data/type/job";
import { cookies } from "next/headers";
import { VideoMockInterviewCard } from "@/features/jobInfos/components/VideoMockInterviewCard";
import { options } from "@/data/type/job-infos";


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
      <div className="space-y-6">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <BackLink href="/personalJob">{""}</BackLink>
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
          {options.slice(0, 3).map((option) => {
            const Icon = option.icon;
            return (
              <Link
                className="hover:scale-[1.01] transition-[transform_opacity]"
                href={`/job-infos/${jobInfoId}/${option.href}`}
                key={option.href}
              >
                <Card className="h-full flex items-start justify-between flex-row border-l-[3px] border-l-foreground hover:shadow-md transition-shadow">
                  <CardHeader className="flex-grow flex-row items-start gap-3 space-y-0">
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
          <VideoMockInterviewCard jobInfoId={jobInfoId} />
          {options.slice(3).map((option) => {
            const Icon = option.icon;
            return (
              <Link
                className="hover:scale-[1.01] transition-[transform_opacity]"
                href={`/job-infos/${jobInfoId}/${option.href}`}
                key={option.href}
              >
                <Card className="h-full flex items-start justify-between flex-row border-l-[3px] border-l-foreground hover:shadow-md transition-shadow">
                  <CardHeader className="flex-grow flex-row items-start gap-3 space-y-0">
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