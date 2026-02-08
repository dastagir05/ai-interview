import { Job } from "@/data/type/job";

export function filterJobs(
  jobs: Job[],
  searchQuery: string,
  activeFilters: string[]
): Job[] {
  let filtered = [...jobs];

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.tech.some((t) => t.toLowerCase().includes(query)) ||
        job.subCategory.toLowerCase().includes(query)
    );
  }

  // Active filters
  if (activeFilters.length > 0) {
    filtered = filtered.filter((job) => {
      return activeFilters.every((filter) => {
        switch (filter) {
          case "Junior":
            return job.level === "JUNIOR";
          case "Senior":
            return job.level === "SENIOR";
          case "Programming":
            return job.category === "PROGRAMMING";
          case "Framework":
            return job.category === "FRAMEWORK";
          case "System Design":
            return job.category === "SYSTEM_DESIGN";
          case "Java":
            return job.subCategory === "JAVA";
          case "Python":
            return job.subCategory === "PYTHON";
          case "JavaScript":
            return job.subCategory === "JAVASCRIPT";
          case "Spring Boot":
            return job.subCategory === "SPRING_BOOT";
          case "MERN":
            return job.subCategory === "MERN";
          default:
            return true;
        }
      });
    });
  }

  return filtered;
}