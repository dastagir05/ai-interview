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
  Layout,
  Server,
  Coffee,
  Box,
  LucideIcon,
} from "lucide-react";
import { Job } from "@/data/type/job";
import {
  ROLE_SECTIONS,
  SECTION_LABELS,
  SUB_CATEGORY_TO_SECTION,
} from "@/data/type/dashboard";
import type { Metadata } from "next";

const metadata: Metadata = {
  title: "Dashboard | IPrepWithAI",
  description: "Manage your interview preparation and practice sessions",
  openGraph: {
    title: "Dashboard | IPrepWithAI",
    description: "Manage your interview preparation",
    type: "website",
  },
};
export type Section = {
  title: string;
  icon: LucideIcon;
  jobs: Job[];
};

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  layout: Layout,
  server: Server,
  coffee: Coffee,
  code: Code,
  box: Box,
  layers: Layers,
  briefcase: Briefcase,
};

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { data: jobs = [], isLoading, isError } = useDashboardJobs();

  const filteredJobs = useMemo(
    () => filterJobs(jobs, searchQuery, activeFilters),
    [jobs, searchQuery, activeFilters]
  );

  const sections: Section[] = useMemo(() => {
    const result: Section[] = [];

    const continueJobs = filteredJobs.filter((j) => j.progress > 0);
    if (continueJobs.length > 0) {
      result.push({
        title: "Continue Practicing",
        icon: TrendingUp,
        jobs: continueJobs,
      });
    }

    ROLE_SECTIONS.forEach((sectionKey) => {
      const sectionJobs = filteredJobs.filter((job) => {
        const mappedSection = SUB_CATEGORY_TO_SECTION[job.subCategory || ""];
        return mappedSection === sectionKey;
      });

      if (sectionJobs.length > 0) {
        result.push({
          title: SECTION_LABELS[sectionKey],
          icon: ICON_MAP[getIconName(sectionKey)] || Code,
          jobs: sectionJobs,
        });
      }
    });

    return result;
  }, [filteredJobs]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveFilters([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading PublicJobs...</p>
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

function getIconName(sectionKey: string): string {
  const iconMap: Record<string, string> = {
    FRONTEND: "layout",
    BACKEND_NODE: "server",
    BACKEND_JAVA: "coffee",
    BACKEND_PYTHON: "code",
    BACKEND_DOTNET: "box",
    FULLSTACK: "layers",
    SYSTEM_DESIGN: "briefcase",
  };
  return iconMap[sectionKey] || "code";
}