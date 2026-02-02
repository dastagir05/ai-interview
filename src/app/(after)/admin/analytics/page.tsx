"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}

function AdminAnalyticsContent() {
  // Mock data - replace with actual API calls
  const timeRange = "30d"; // This would come from state

  const metrics = {
    userGrowth: {
      current: 1250,
      previous: 1100,
      change: 13.6,
      trend: "up",
    },
    interviewGrowth: {
      current: 3420,
      previous: 2980,
      change: 14.8,
      trend: "up",
    },
    jobUsage: {
      current: 45,
      previous: 38,
      change: 18.4,
      trend: "up",
    },
    avgInterviewDuration: {
      current: 28,
      previous: 25,
      change: 12,
      trend: "up",
    },
  };

  const topJobs = [
    { title: "Senior Full Stack Developer", count: 234, growth: 15 },
    { title: "React Developer", count: 189, growth: 8 },
    { title: "Data Scientist", count: 67, growth: -5 },
    { title: "Python Developer", count: 145, growth: 22 },
  ];

  const userActivity = [
    { date: "2024-03-01", users: 120, interviews: 45 },
    { date: "2024-03-02", users: 135, interviews: 52 },
    { date: "2024-03-03", users: 150, interviews: 60 },
    { date: "2024-03-04", users: 145, interviews: 58 },
    { date: "2024-03-05", users: 160, interviews: 65 },
  ];

  const categoryDistribution = [
    { category: "PROGRAMING", count: 1250, percentage: 45 },
    { category: "DATA_SCIENCE", count: 890, percentage: 32 },
    { category: "DESIGN", count: 450, percentage: 16 },
    { category: "OTHER", count: 230, percentage: 7 },
  ];

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
          <Select defaultValue={timeRange}>
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userGrowth.current}</div>
            <div className="flex items-center gap-1 text-xs">
              {metrics.userGrowth.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  metrics.userGrowth.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.userGrowth.change}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Growth</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.interviewGrowth.current}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {metrics.interviewGrowth.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  metrics.interviewGrowth.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.interviewGrowth.change}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Usage</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.jobUsage.current}</div>
            <div className="flex items-center gap-1 text-xs">
              {metrics.jobUsage.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  metrics.jobUsage.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.jobUsage.change}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Interview Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgInterviewDuration.current} min
            </div>
            <div className="flex items-center gap-1 text-xs">
              {metrics.avgInterviewDuration.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  metrics.avgInterviewDuration.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {metrics.avgInterviewDuration.change}%
              </span>
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Practice Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topJobs.map((job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.count} interviews
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.growth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={
                        job.growth > 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {Math.abs(job.growth)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{activity.date}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{activity.users} users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {activity.interviews} interviews
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

