export const adminApi = {
  getStats: () => fetch("/api/admin/dashboard/stats").then((r) => r.json()),
  getPublicJobs: () =>
    fetch("/api/admin/dashboard/publicJobs").then((r) => r.json()),
  getUsers: () =>
    fetch("/api/admin/dashboard/users").then((r) => r.json()),
  getInterviews: (limit = 50) =>
    fetch(`/api/admin/dashboard/interviews?limit=${limit}`).then((r) =>
      r.json()
    ),
  getActivity: (limit = 10) =>
    fetch(`/api/admin/dashboard/activity?limit=${limit}`).then((r) =>
      r.json()
    ),
  getAnalyticsMetrics: (range = "30d") =>
    fetch(`/api/admin/analytics/metrics?range=${range}`).then((r) =>
      r.json()
    ),
  getAnalyticsTopJobs: (range = "30d", limit = 10) =>
    fetch(
      `/api/admin/analytics/top-jobs?range=${range}&limit=${limit}`
    ).then((r) => r.json()),
  getAnalyticsDailyActivity: (range = "30d") =>
    fetch(`/api/admin/analytics/daily-activity?range=${range}`).then((r) =>
      r.json()
    ),
  getAnalyticsCategoryDistribution: (range = "30d") =>
    fetch(
      `/api/admin/analytics/category-distribution?range=${range}`
    ).then((r) => r.json()),
};
  