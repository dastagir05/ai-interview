"use client";

import { useState } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashHeader";
import { JobSection } from "@/features/dashboard/components/JobSection";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { useDashboardJobs } from "@/features/dashboard/components/useDashboardJobs";
import { filterJobs } from "@/features/dashboard/components/filterJobs";
import { Code, TrendingUp, Briefcase, Layers } from "lucide-react";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { data: jobs = [], isLoading } = useDashboardJobs();

  const filteredJobs = filterJobs(jobs, searchQuery, activeFilters);

  // Define sections with their filters
  const sections = [
    {
      title: "Continue Practicing",
      icon: TrendingUp,
      jobs: filteredJobs.filter(j => j.progress > 0),
    },
    {
      title: "Java Interviews - Senior",
      icon: Code,
      jobs: filteredJobs.filter(j => j.subCategory === "JAVA" && j.level === "SENIOR"),
    },
    {
      title: "Java Interviews - Junior",
      icon: Code,
      jobs: filteredJobs.filter(j => j.subCategory === "JAVA" && j.level === "JUNIOR"),
    },
    {
      title: "Python Interviews - Senior",
      icon: Code,
      jobs: filteredJobs.filter(j => j.subCategory === "PYTHON" && j.level === "SENIOR"),
    },
    {
      title: "Python Interviews - Junior",
      icon: Code,
      jobs: filteredJobs.filter(j => j.subCategory === "PYTHON" && j.level === "JUNIOR"),
    },
    {
      title: "JavaScript Interviews - Senior",
      icon: Code,
      jobs: filteredJobs.filter(j => j.subCategory === "JAVASCRIPT" && j.level === "SENIOR"),
    },
    {
      title: "JavaScript Interviews - Junior",
      icon: Code,
      jobs: filteredJobs.filter(j => j.subCategory === "JAVASCRIPT" && j.level === "JUNIOR"),
    },
    {
      title: "Spring Boot Practice",
      icon: Briefcase,
      jobs: filteredJobs.filter(j => j.subCategory === "SPRING_BOOT"),
    },
    {
      title: "MERN Stack Practice",
      icon: Layers,
      jobs: filteredJobs.filter(j => j.subCategory === "MERN"),
    },
    {
      title: "System Design - Senior",
      icon: Briefcase,
      jobs: filteredJobs.filter(j => j.category === "SYSTEM_DESIGN" && j.level === "SENIOR"),
    },
    {
      title: "System Design - Junior",
      icon: Briefcase,
      jobs: filteredJobs.filter(j => j.category === "SYSTEM_DESIGN" && j.level === "JUNIOR"),
    },
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {filteredJobs.length === 0 ? (
          <EmptyState onClearFilters={handleClearFilters} />
        ) : (
          <div className="space-y-10">
            {sections.map((section, index) => (
              <JobSection
                key={index}
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