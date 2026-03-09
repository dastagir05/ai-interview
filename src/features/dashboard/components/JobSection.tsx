"use client";

import { useRef, useState } from "react";
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
  const [isSectionHovered, setIsSectionHovered] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (jobs.length === 0) return null;

  const showScrollButtons = jobs.length > 5;

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center mb-4">
        {Icon && <Icon size={24} className="mr-2 text-muted-foreground" />}
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="ml-3 text-muted-foreground text-sm">
          ({jobs.length})
        </span>
      </div>

      <div
        className="flex items-center w-full"
        onMouseEnter={() => setIsSectionHovered(true)}
        onMouseLeave={() => setIsSectionHovered(false)}
      >
        {showScrollButtons && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className={`shrink-0 -ml-14 bg-background hover:bg-muted shadow-md rounded-full h-10 w-10 z-10 border border-border/50 transition-opacity ${
              isSectionHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}

        {/* Cards Container - full width section, scrolls inside */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 w-full min-w-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {showScrollButtons && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className={`shrink-0 -mr-14 bg-background hover:bg-muted shadow-md rounded-full h-10 w-10 z-10 border border-border/50 transition-opacity ${
              isSectionHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
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