"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "./JobCard";
import { Job } from "@/data/type/job";

interface JobSectionProps {
  title: string;
  jobs: Job[];
  icon?: LucideIcon;
}

export function JobSection({ title, jobs, icon: Icon }: JobSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Don't render if no jobs
  if (jobs.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Section Header */}
      <div className="flex items-center mb-4">
        {Icon && <Icon size={24} className="mr-2 text-muted-foreground" />}
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="ml-3 text-muted-foreground text-sm">
          ({jobs.length})
        </span>
      </div>

      <div className="relative group">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background shadow-md opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        >
          <ChevronLeft className="h-6 w-6 " />
        </Button>

        {/* Cards Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Right Scroll Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background shadow-md opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}