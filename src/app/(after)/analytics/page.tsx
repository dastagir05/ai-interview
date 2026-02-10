"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  MessageSquare,
  Calendar,
  Download,
  ArrowLeft,
  XCircle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Lock,
  Crown,
  Zap,
  Trophy,
  Star,
  Flame,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRouteProps";
import { useQuery } from "@tanstack/react-query";
import { UserAnalytics } from "@/data/type/analytics";
import { useAuth } from "@/lib/useAuth";

export default function UserAnalyticsPage() {
  return (
    <ProtectedRoute>
      <UserAnalyticsContent />
    </ProtectedRoute>
  );
}

function UserAnalyticsContent() {
  
  const user = useAuth();
  console.log("user in analy", user)
  const userTier : any = user.user?.tier; 
  const timeRange = "30d";

  const { data: stats  } = useQuery<UserAnalytics>({
    queryKey: ["user-analytics"],
    queryFn: () =>
      fetch("/api/analytics/stats").then(r => r.json()),
  });

  console.log("stats", stats);
  const metrics = stats?.metrics
  const skillScores = stats?.skills
  const dailyActivity = stats?.dailyActivity
  const recentInterviews = stats?.recentInterviews

  // const metrics = {
  //   totalInterviews: 24,
  //   passRate: 62,
  //   failRate: 38,
  //   averageScore: 7.4,
  //   activeDays: 12,
  //   currentStreak: 5,
  //   longestStreak: 9,
  // };

  // const skillScores = {
  //   technical: 8.2,
  //   problemSolving: 7.5,
  //   codeQuality: 6.8,
  //   communication: 7.9,
  // };

  const achievements = [
    {
      id: 1,
      name: "First Interview",
      description: "Completed your first mock interview",
      icon: Star,
      unlocked: true,
      unlockedDate: "2024-02-15",
    },
    {
      id: 2,
      name: "On Fire",
      description: "Maintained a 5-day streak",
      icon: Flame,
      unlocked: true,
      unlockedDate: "2024-03-01",
    },
    {
      id: 3,
      name: "Perfectionist",
      description: "Scored 9+ in an interview",
      icon: Trophy,
      unlocked: true,
      unlockedDate: "2024-02-28",
    },
    {
      id: 4,
      name: "Dedicated",
      description: "Complete 20+ interviews",
      icon: Target,
      unlocked: true,
      unlockedDate: "2024-03-04",
    },
    {
      id: 5,
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: Zap,
      unlocked: false,
      progress: 5,
      total: 7,
    },
    {
      id: 6,
      name: "Master",
      description: "Achieve 90% pass rate over 10 interviews",
      icon: Crown,
      unlocked: false,
      progress: 62,
      total: 90,
    },
  ];

  const insights = {
    strengths: [
      "Strong technical knowledge with consistent 8+ scores",
      "Excellent communication skills during problem explanation",
      "Good improvement trend in problem-solving over last 10 interviews",
    ],
    improvements: [
      "Code quality needs attention - focus on clean code principles",
      "Time management in coding challenges could be better",
      "Edge case handling in solutions needs improvement",
    ],
    recommendations: [
      "Practice writing unit tests for your solutions",
      "Review SOLID principles and design patterns",
      "Work on optimizing algorithm complexity",
      "Try timed coding challenges to improve speed",
    ],
    nextMilestone: {
      title: "Reach 90% pass rate",
      current: 62,
      target: 90,
      interviewsNeeded: 8,
    },
  };

  const renderSkillChart = () => {
    const skills = [
      { name: "Technical Knowledge", score: skillScores?.technical, color: "bg-blue-500" },
      {
        name: "Problem Solving",
        score: skillScores?.problemSolving,
        color: "bg-purple-500",
      },
      {
        name: "Code Quality",
        score: skillScores?.codeQuality,
        color: "bg-orange-500",
      },
      {
        name: "Communication",
        score: skillScores?.communication,
        color: "bg-green-500",
      },
    ];

    return (
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{skill.name}</span>
              <span className="text-sm font-bold">{skill.score}/10</span>
            </div>
            {/* Block-style progress bar */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2.5 flex-1 rounded-sm ${
                    index < Math.round(skill.score != undefined ?skill.score : 0)
                      ? skill.color
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container my-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold">My Analytics</h1>
              <Badge variant="outline" className="text-xs">
                {userTier} Plan
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2">
              Track your mock interviews, scores, and progress over time.
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

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Interviews
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalInterviews}</div>
            <p className="text-xs text-muted-foreground">
              Total AI mock interviews completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Quiz Performance</CardTitle>
            <CardDescription>
              Your performance on 15-minute knowledge checks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total quizzes */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Quizzes</span>
                <span className="text-lg font-bold">12 completed</span>
              </div>
              
              {/* Pass/Fail for quizzes */}
              {/* <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Passed (6+/10)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  8 quizzes (67%)
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Failed (&gt6/10)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  4 quizzes (33%)
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-3 flex overflow-hidden">
                <div className="bg-green-600 h-3" style={{ width: "67%" }} />
                <div className="bg-red-600 h-3" style={{ width: "33%" }} />
              </div>
               */}
              {/* Average quiz score */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Score</span>
                  <span className="text-lg font-bold">7.2/10</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageScore}/10
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Average rating across all interviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.currentStreak} days</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Longest: {metrics?.longestStreak} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution + Recent Interviews */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>
              How your interview scores are distributed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Excellent (9-10) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-green-700">Excellent (9-10)</span>
                  <span className="text-muted-foreground">3 interviews (12%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "12%" }} />
                </div>
              </div>

              {/* Good (7-8) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-blue-700">Good (7-8)</span>
                  <span className="text-muted-foreground">11 interviews (46%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "46%" }} />
                </div>
              </div>

              {/* Fair (5-6) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-orange-700">Fair (5-6)</span>
                  <span className="text-muted-foreground">7 interviews (29%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: "29%" }} />
                </div>
              </div>

              {/* Needs Work (0-4) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-red-700">Needs Work (0-4)</span>
                  <span className="text-muted-foreground">3 interviews (13%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: "13%" }} />
                </div>
              </div>

              <div className="pt-3 mt-3 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  💡 Most of your scores fall in the "Good" range. Keep practicing to reach "Excellent"!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInterviews != undefined && recentInterviews.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {item.score}/10
                    </span>
                    <Badge
                      className={
                        item.status === "Passed"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Breakdown - Available for BASIC+ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Skill Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your performance across different skill categories
              </p>
            </div>
            {userTier === "FREE" && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                BASIC+
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {userTier !== "FREE" ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div>{renderSkillChart()}</div>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Strongest Skill
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Technical Knowledge</strong> - You consistently
                    score high in technical assessments. Keep up the great work!
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    Focus Area
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Code Quality</strong> - This area has room for
                    improvement. Consider practicing clean code principles and
                    design patterns.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Unlock Skill Breakdown
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Upgrade to BASIC plan to see detailed breakdown of your skills
                and get personalized insights on what to improve.
              </p>
              <Button asChild>
                <Link href="/dashboard/settings">Upgrade to BASIC</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalized Insights - PRO only */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Personalized Insights
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered recommendations based on your performance
              </p>
            </div>
            {userTier !== "PRO" && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {userTier === "PRO" ? (
            <div className="space-y-6">
              {/* Strengths */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Your Strengths
                </h4>
                <ul className="space-y-2">
                  {insights.strengths.map((strength, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm p-3 bg-green-50 rounded-lg"
                    >
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                  <Target className="h-4 w-4" />
                  Areas to Improve
                </h4>
                <ul className="space-y-2">
                  {insights.improvements.map((improvement, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm p-3 bg-orange-50 rounded-lg"
                    >
                      <span className="text-orange-600 mt-0.5">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                  <Lightbulb className="h-4 w-4" />
                  Recommended Actions
                </h4>
                <ul className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm p-3 bg-blue-50 rounded-lg"
                    >
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Milestone */}
              <div className="p-4 border-2 border-dashed rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  Next Milestone
                </h4>
                <p className="text-sm mb-3">{insights.nextMilestone.title}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {insights.nextMilestone.current}% /{" "}
                      {insights.nextMilestone.target}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (insights.nextMilestone.current /
                            insights.nextMilestone.target) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Approximately {insights.nextMilestone.interviewsNeeded} more
                    successful interviews needed
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Crown className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Unlock Personalized Insights
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Upgrade to PRO plan to get AI-powered insights, detailed
                strengths & weaknesses analysis, and personalized recommendations
                after every interview.
              </p>
              <Button asChild>
                <Link href="/dashboard/settings">Upgrade to PRO</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your interview activity over the past week
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyActivity != undefined && dailyActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{activity.date}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold">
                      {activity.interviews}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      interviews
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold">
                      {activity.avgScore.toFixed(1)}/10
                    </span>
                    <span className="text-xs text-muted-foreground">
                      avg score
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