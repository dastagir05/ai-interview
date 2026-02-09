export const adminApi = {
    getStats: () => fetch("/api/admin/dashboard/stats").then(r => r.json()),
    getPublicJobs: () => fetch("/api/admin/dashboard/publicJobs").then(r => r.json())
    // getPracticeJobs: () => fetch("/api/admin/dashboard/practice-jobs").then(r => r.json())
    // getInterviews: () => fetch("/api/admin/dashboard/interviews").then(r => r.json())
    // getUsers: () => fetch("/api/admin/dashboard/users").then(r => r.json())
    // getJobs: () => fetch("/api/admin/dashboard/jobs").then(r => r.json())
    // getInterviews: () => fetch("/api/admin/dashboard/interviews").then(r => r.json())
    // getUsers: () => fetch("/api/admin/dashboard/users").then(r => r.json())
    // getJobs: () => fetch("/api/admin/dashboard/jobs").then(r => r.json())
    // getInterviews: () => fetch("/api/admin/dashboard/interviews").then(r => r.json())
    // getUsers: () => fetch("/api/admin/dashboard/users").then(r => r.json())
    // getJobs: () => fetch("/api/admin/dashboard/jobs").then(r => r.json())
  };
  