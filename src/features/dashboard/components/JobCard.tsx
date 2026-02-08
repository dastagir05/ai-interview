"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, PlayIcon, ArrowRight, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Job } from "@/data/type/job";
import { toast } from "sonner";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const res = await fetch(`/api/publicJobs/${job.id}/start`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to start practice job");
      }

      const data = await res.json();
      toast.success("Practice job started!");
      router.push(`/personalJob`);
    } catch (error) {
      toast.error("Failed to start practice job. Please try again.");
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleResume = () => {
    router.push(`/personalJob`);
  };

  const levelColors: Record<string, string> = {
    JUNIOR: "bg-green-500 hover:bg-green-600",
    SENIOR: "bg-orange-500 hover:bg-orange-600",
  };

  return (
    <Card className="flex-shrink-0 w-72 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      {/* Logo Section */}
      <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-b">
        <img src={job.logo} alt="" />
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-base mb-1 mt-2 truncate group-hover:text-primary transition-colors">
          {job.title}
        </h3>

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-1 mb-3 mt-2">
          {job.tech.slice(0, 3).map((tech, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Time and Level */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock size={14} className="mr-1" />
            {job.time}min
          </div>
          <Badge className={`${levelColors[job.level]} text-white border-0`}>
            {job.level}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
        {job.description.length > 120 
          ? `${job.description.slice(0, 120)}...` 
          : job.description
        }
      </p>

        {/* Progress Bar (if started) */}
        {job.progress > 0 && (
          <div className="mb-3">
            <Progress value={job.progress} className="h-1.5 mb-1" />
            <p className="text-xs text-muted-foreground">
              {job.progress}% complete
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* Action Button */}
        {job.progress > 0 ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResume}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleStart}
            disabled={isStarting}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <PlayIcon className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}