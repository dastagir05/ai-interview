import { BackLink } from "@/components/BackLink";
import { Card, CardContent } from "@/components/ui/card";
import { PublicJobInfoForm } from "@/features/admin/CreatePublicJob";

export default function PublicJobInfoNewPage() {
  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <BackLink href="/dashboard">Dashboard</BackLink>

      <h1 className="text-3xl md:text-4xl">Create New Job Description</h1>

      <Card>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
