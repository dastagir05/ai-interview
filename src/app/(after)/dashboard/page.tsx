"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashHeader";
import { JobSection } from "@/features/dashboard/components/JobSection";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { useDashboardJobs } from "@/features/dashboard/components/useDashboardJobs";
import { filterJobs } from "@/features/dashboard/components/filterJobs";
import {
  Code,
  TrendingUp,
  Briefcase,
  Layers,
  LucideIcon,
} from "lucide-react";
import { Job } from "@/data/type/job";
import { LANGUAGE_SECTIONS, LABEL_MAP} from "@/data/type/dashboard"

export type Section = {
  title: string;
  icon: LucideIcon;
  jobs: Job[];
};

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { data: jobs = [], isLoading, isError } = useDashboardJobs();

  const filteredJobs = useMemo(
    () => filterJobs(jobs, searchQuery, activeFilters),
    [jobs, searchQuery, activeFilters]
  );

  const sections: Section[] = [];

  const continueJobs = filteredJobs.filter((j) => j.progress > 0);
  if (continueJobs.length > 0) {
    sections.push({
      title: "Continue Practicing",
      icon: TrendingUp,
      jobs: continueJobs,
    });
  }

  LANGUAGE_SECTIONS.forEach((lang) => {
    const langJobs = filteredJobs.filter(
      (j) => j.subCategory === lang
    );

    if (langJobs.length > 0) {
      sections.push({
        title: `${LABEL_MAP[lang]} Interviews`,
        icon: Code,
        jobs: langJobs,
      });
    }
  });

  const springJobs = filteredJobs.filter(
    (j) => j.subCategory === "SPRING_BOOT"
  );
  if (springJobs.length > 0) {
    sections.push({
      title: "Spring Boot Practice",
      icon: Briefcase,
      jobs: springJobs,
    });
  }

  const mernJobs = filteredJobs.filter(
    (j) => j.subCategory === "MERN"
  );
  if (mernJobs.length > 0) {
    sections.push({
      title: "MERN Stack Practice",
      icon: Layers,
      jobs: mernJobs,
    });
  }

  const systemDesignJobs = filteredJobs.filter(
    (j) => j.category === "SYSTEM_DESIGN"
  );
  if (systemDesignJobs.length > 0) {
    sections.push({
      title: "System Design",
      icon: Briefcase,
      jobs: systemDesignJobs,
    });
  }

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveFilters([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interviews...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Failed to load jobs.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {sections.length === 0 ? (
          <EmptyState onClearFilters={handleClearFilters} />
        ) : (
          <div className="space-y-10">
            {sections.map((section) => (
              <JobSection
                key={section.title}
                title={section.title}
                jobs={section.jobs}
                icon={section.icon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
