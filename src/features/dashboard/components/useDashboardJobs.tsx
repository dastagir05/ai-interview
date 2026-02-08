"use client";

import { useQuery } from "@tanstack/react-query";
import { Job } from "@/data/type/job";

export function useDashboardJobs() {
  return useQuery<Job[]>({
    queryKey: ["dashboard-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/publicJobs/getAllForUser");
      
      if (!res.ok) {
        throw new Error("Failed to fetch practice jobs");
      }

      const data = await res.json();

      // Transform API response to Job type
      return data.map((job: any): Job => ({
        id: job.id,
        title: job.title,
        logo: job.imgUrl ?? "💼",
        tech: job.skillsRequired ?? [],
        time: job.estimatedTime ?? 45,
        level: job.experienceLevel,
        category: job.category === "PROGRAMING" ? "PROGRAMMING" : job.category,
        subCategory: job.subCategory?.toUpperCase() ?? "GENERAL",
        progress: job.progress ?? 0,
        description: job.description ?? "",
        started: job.started ?? false,
        personalJobId: job.personalJobId ?? null,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}