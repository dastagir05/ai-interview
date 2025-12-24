import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { env } from "@/data/env/server";
import { PracticeJobAction } from "./PracticeJobAction";
import { getCurrentUserId } from "@/lib/auth";


export default async function JobInfos() {

  let jobInfos: PublicJobDetails[] = [];
  const userId = await getCurrentUserId();
  try {
    jobInfos = await fetch(`${env.BACKEND_URL}/practice-jobs?userId=${userId}`).then((res) => res.json());
    console.log("jobInfos", jobInfos)
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
                {/* <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent> */}
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
        Welcome to IPrepareWithAI 
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


// "use client";

// import { useEffect, useState } from "react";

// type PracticeJob = {
//   id: string;
//   title: string;
//   category: string;
//   description: string;
//   enabled: boolean;
// };

// export default function AdminPracticeJobsPage() {
//   const [jobs, setJobs] = useState<PracticeJob[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("/api/admin/publicJobs")
//       .then(setJobs)
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Practice Jobs</h1>

//       <a
//         href="/admin/practice-jobs/create"
//         className="bg-black text-white px-4 py-2 rounded"
//       >
//         + Create Job
//       </a>

//       <div className="mt-6 space-y-4">
//         {jobs.map((job) => (
//           <div
//             key={job.id}
//             className="border p-4 rounded flex justify-between"
//           >
//             <div>
//               <h2 className="font-semibold">{job.title}</h2>
//               <p className="text-sm text-gray-600">{job.description}</p>
//             </div>

//             <span
//               className={`px-3 py-1 rounded text-sm ${
//                 job.enabled ? "bg-green-200" : "bg-red-200"
//               }`}
//             >
//               {job.enabled ? "ENABLED" : "DISABLED"}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
