import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PublicJobDetails } from "@/data/type/job";
import { PublicJobInfoForm } from "@/features/admin/CreatePublicJob";
import { PracticeJobAction } from "./PracticeJobAction";
import { cookies } from "next/headers";

export default async function Dashboard() {
  
  let jobInfos: PublicJobDetails[] = [];
  try {
    jobInfos = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/publicJobs/getAllForUser`, {
      headers: {
        Cookie: (await cookies()).toString(),
      },
    }).then((res) => res.json());
    // console.log("jobInfos", jobInfos)
  } catch (error) {
    // toast.error("Failed to load job descriptions");
    console.log("fail to fetch job", error)
    return null;
  }
  if (jobInfos.length === 0) {
    return <NoJobInfos />;
  }

  return (
    <div className="container my-4">
      <div className="flex gap-2 justify-between mb-6 mt-8">
        <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold">
          Select a job description
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        {jobInfos.map((jobInfo) => (
          <Link
            className="hover:scale-[1.02] transition-[transform_opacity]"
            href={`/personalJob`}
            key={jobInfo.id}
          >
            <Card className="h-full">
              <div className="flex items-center justify-between h-full">
                <div className="space-y-4 h-full">
                  <img src={jobInfo.imgUrl} alt={jobInfo.title} width={100} height={100} />
                  <CardHeader>
                    <CardTitle className="text-lg">{jobInfo.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground line-clamp-3">
                    {jobInfo.description}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Badge variant="outline">{jobInfo.experienceLevel}</Badge>
                    <Badge variant="outline">{jobInfo.category}</Badge>
                    {jobInfo.skillsRequired?.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                  </CardFooter>
                </div>
                <CardContent>
                <PracticeJobAction
                  practiceJobId={jobInfo.id}
                  started={jobInfo.started}
                  personalJobId={jobInfo.personalJobId}
                />
              </CardContent>

              </div>
            </Card>
          </Link>
        ))}

      </div>
    </div>
  );
}

function NoJobInfos() {
  return (
    <div className="container my-4 max-w-5xl">
      <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4">
        Welcome to IPrepWithAI 
      </h1>
      <p className="text-muted-foreground mb-8">
        To get started, enter information about the type of job you are wanting
        to apply for. This can be specific information copied directly from a
        job listing or general information such as the tech stack you want to
        work in. The more specific you are in the description the closer the
        test interviews will be to the real thing.
      </p>
      <Card>
        <CardContent>
          <PublicJobInfoForm
            jobInfo={{
              title: "",
              description: "",
              category:"PROGRAMING",
              imgUrl: "",
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