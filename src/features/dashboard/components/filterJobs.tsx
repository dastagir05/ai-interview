import { Job } from "@/data/type/job";

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

        if (f === "junior" || f === "senior") {
          return job.level?.toLowerCase() === f;
        }

        if (["programming", "framework", "system design"].includes(f)) {
          return (
            job.category
              ?.toLowerCase()
              .replace("_", " ") === f
          );
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
