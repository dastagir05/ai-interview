import { Job } from "@/data/type/job";
import { SUB_CATEGORY_TO_SECTION } from "@/data/type/dashboard";

export function filterJobs(
  jobs: Job[],
  searchQuery: string,
  activeFilters: string[]
): Job[] {
  return jobs.filter((job) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        job.title?.toLowerCase().includes(q) ||
        job.subCategory?.toLowerCase().includes(q) ||
        job.tech?.some((t) => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;
    }

    if (activeFilters.length > 0) {
      const matchesAll = activeFilters.every((filter) => {
        const f = filter.toLowerCase();

        if (["internship", "junior", "mid_level", "senior"].includes(f)) {
          return job.level?.toLowerCase() === f;
        }

        const sectionKey = Object.keys(SUB_CATEGORY_TO_SECTION).find(
          (key) => SUB_CATEGORY_TO_SECTION[key].toLowerCase() === f
        );
        if (sectionKey && job.subCategory === sectionKey) {
          return true;
        }

        if (job.subCategory?.toLowerCase() === f.replace(" ", "_")) {
          return true;
        }

        if (job.tech?.some((t) => t.toLowerCase() === f)) {
          return true;
        }

        return false;
      });

      if (!matchesAll) return false;
    }

    return true;
  });
}