"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  MessageSquare,
  Calendar,
  Download,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRouteProps";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin";

export type AnalyticsTimeRange = "7d" | "30d" | "90d" | "1y";

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}

interface AnalyticsMetrics {
  userGrowth?: { current?: number; previous?: number; change?: number; trend?: string };
  interviewGrowth?: { current?: number; previous?: number; change?: number; trend?: string };
  jobUsage?: { current?: number; previous?: number; change?: number; trend?: string };
  avgInterviewDuration?: { current?: number; previous?: number; change?: number; trend?: string };
}

interface TopJobItem {
  title?: string;
  jobTitle?: string;
  count?: number;
  interviews?: number;
  growth?: number;
}

interface DailyActivityItem {
  date?: string;
  users?: number;
  interviews?: number;
}

interface CategoryItem {
  category?: string;
  count?: number;
  percentage?: number;
}

function AdminAnalyticsContent() {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("30d");

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["admin-analytics-metrics", timeRange],
    queryFn: () => adminApi.getAnalyticsMetrics(timeRange),
  });

  const { data: topJobsData } = useQuery({
    queryKey: ["admin-analytics-top-jobs", timeRange],
    queryFn: () => adminApi.getAnalyticsTopJobs(timeRange, 10),
  });

  const { data: dailyActivityData } = useQuery({
    queryKey: ["admin-analytics-daily-activity", timeRange],
    queryFn: () => adminApi.getAnalyticsDailyActivity(timeRange),
  });

  const { data: categoryData } = useQuery({
    queryKey: ["admin-analytics-category-distribution", timeRange],
    queryFn: () => adminApi.getAnalyticsCategoryDistribution(timeRange),
  });

  const metrics = (metricsData ?? {}) as AnalyticsMetrics;
  const topJobs = (Array.isArray(topJobsData) ? topJobsData : []) as TopJobItem[];
  const userActivity = (Array.isArray(dailyActivityData) ? dailyActivityData : []) as DailyActivityItem[];
  const categoryDistribution = (Array.isArray(categoryData) ? categoryData : []) as CategoryItem[];

  return (
    <div className="container my-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Detailed insights and performance metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as AnalyticsTimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {metricsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <>
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="pb-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userGrowth?.current ?? 0}</div>
            <div className="flex items-center gap-1 text-xs">
              {(metrics.userGrowth?.trend ?? "up") === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  (metrics.userGrowth?.trend ?? "up") === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.userGrowth?.change ?? 0}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="pb-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Growth</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.interviewGrowth?.current ?? 0}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {(metrics.interviewGrowth?.trend ?? "up") === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  (metrics.interviewGrowth?.trend ?? "up") === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.interviewGrowth?.change ?? 0}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="pb-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Usage</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.jobUsage?.current ?? 0}</div>
            <div className="flex items-center gap-1 text-xs">
              {(metrics.jobUsage?.trend ?? "up") === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  (metrics.jobUsage?.trend ?? "up") === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.jobUsage?.change ?? 0}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="pb-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Interview Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgInterviewDuration?.current ?? 0} min
            </div>
            <div className="flex items-center gap-1 text-xs">
              {(metrics.avgInterviewDuration?.trend ?? "up") === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  (metrics.avgInterviewDuration?.trend ?? "up") === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.avgInterviewDuration?.change ?? 0}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Jobs */}
        <Card className="pb-4">
          <CardHeader>
            <CardTitle>Most Popular Practice Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No job data for this period</p>
              ) : (
                topJobs.map((job, index) => {
                  const count = job.count ?? job.interviews ?? 0;
                  const growth = job.growth ?? 0;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{job.title ?? job.jobTitle ?? "—"}</p>
                        <p className="text-sm text-muted-foreground">
                          {count} interviews
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {growth > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={
                            growth > 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {Math.abs(growth)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="pb-4">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">No category data for this period</p>
              ) : (
                categoryDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.category ?? "—"}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count ?? 0} ({(item.percentage ?? 0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${item.percentage ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="pb-4">
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity for this period</p>
            ) : (
              userActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{activity.date ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{activity.users ?? 0} users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {activity.interviews ?? 0} interviews
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}

