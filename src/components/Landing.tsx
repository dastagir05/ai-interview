"use client";

import Login from "./Login";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpenCheckIcon,
  Brain,
  FileSlidersIcon,
  SpeechIcon,
  CheckCircle2,
  TrendingUp,
  Award,
} from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { ThemeToggle } from "./ThemeToggle";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navbar />
      <Hero />
      <Features />
      <DetailedFeatures />
      <Stats />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}

function Navbar() {
  const [openDialog, setOpenDialog] = useState(false);
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      if (isAdmin === true) {
        hasRedirected.current = true;
        router.replace("/recruiter/dashboard");
      } else if (user) {
        hasRedirected.current = true;
        router.replace("/dashboard");
      }
    }
  }, [isLoading, isAdmin, user]); // router

  if (!isLoading && (user || isAdmin)) {
    return null;
  }
  
  return (
    <nav className="border-b border-border/50 bg-card/90 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Brain className="size-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              IPrepWithAI
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setOpenDialog(true)}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
            >
              Sign In
            </Button>
            <ThemeToggle />
          </div>
          <Login
            openDialog={openDialog}
            closeDialog={() => setOpenDialog(false)}
          />
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <section className="relative overflow-hidden py-24 sm:py-36">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container relative">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Join 10,000+ professionals advancing their careers
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
            Master interviews with{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              AI-powered
            </span>{" "}
            precision
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform interview anxiety into confidence. Get personalized AI coaching, 
            optimize your resume for recruiters, and master technical challenges—all in one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => setOpenDialog(true)}
            >
              Start Free Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-12 px-8 text-base font-semibold"
              asChild
            >
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>7-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
      <Login openDialog={openDialog} closeDialog={() => setOpenDialog(false)} />
    </section>
  );
}

function Features() {
  const features = [
    {
      title: "AI Interview Coaching",
      Icon: SpeechIcon,
      description:
        "Practice with adaptive AI that mimics real interviewers. Get instant feedback and build genuine confidence for your actual interviews.",
    },
    {
      title: "Quick Quiz Practice",
      Icon: Award,
      description:
        "Practice quizzes to improve your understanding, identify weak areas, and build confidence step by step.",
    },
    {
      title: "Technical Mastery",
      Icon: BookOpenCheckIcon,
      description:
        "Conquer coding challenges with intelligent hints and clear explanations. Develop problem-solving patterns that interviewers love.",
    },
    {
      title: "Resume Optimization",
      Icon: FileSlidersIcon,
      description:
        "Beat ATS systems and impress recruiters. Get AI-powered suggestions that transform your resume into a callback magnet.",
    }
  ];

  return (
    <section id="features" className="py-20 scroll-mt-16">
      <div className="container">
        <div className="text-center mb-12">
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need to <span className="text-primary">succeed</span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed to accelerate your interview success
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-4">
                <div className="w-14 h-14 mb-4 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                  <feature.Icon className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailedFeatures() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container">
        <div className="text-center mb-20">
          <h3 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Your complete interview{" "}
            <span className="text-primary">success toolkit</span>
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Real scenarios, personalized feedback, and proven strategies
          </p>
        </div>

        <div className="space-y-24">
          {/* AI Interview Practice */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                  <SpeechIcon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-foreground">
                  AI Interview Coaching
                </h4>
              </div>
              
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Experience hyper-realistic interview simulations powered by advanced AI. 
                Practice behavioral, technical, and case interviews with an AI coach that 
                adapts to your responses and provides actionable feedback in real-time.
              </p>
              
              <ul className="space-y-3.5">
                {[
                  "Natural voice conversations with intelligent AI",
                  "Instant feedback on delivery and content",
                  "Curated questions from top companies",
                  "Track your improvement over time"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-2xl">
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    AI Interviewer
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  "Walk me through a challenging project where you had to collaborate 
                  with cross-functional teams..."
                </p>
              </div>
              
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">You</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Your Response
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "At my previous company, I led the integration of our analytics 
                  platform with the marketing team's dashboard..."
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                    Clear structure
                  </span>
                  <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                    Strong impact
                  </span>
                  <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                    Good pacing
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Optimization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="lg:order-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                  <FileSlidersIcon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Intelligent Resume Analysis
                </h4>
              </div>
              
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Transform your resume with AI-driven optimization. Get specific, 
                actionable suggestions tailored to your target role, ensuring you 
                pass ATS filters and catch recruiter attention.
              </p>
              
              <ul className="space-y-3.5">
                {[
                  "ATS optimization with compatibility scoring",
                  "Job-specific keyword recommendations",
                  "Impact-focused achievement rewriting",
                  "Before/after performance tracking"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="lg:order-1 bg-card rounded-2xl p-6 border border-border/50 shadow-2xl">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    Overall Resume Score
                  </span>
                  <span className="text-3xl font-bold text-primary">87/100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-1000"
                    style={{ width: "87%" }}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "ATS Compatibility", value: "Excellent", color: "text-green-500" },
                  { label: "Keyword Match", value: "92%", color: "text-primary" },
                  { label: "Impact Statements", value: "Good", color: "text-blue-500" },
                ].map((metric, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <span className="text-sm font-medium text-foreground">
                      {metric.label}
                    </span>
                    <span className={`text-sm font-semibold ${metric.color}`}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">
                      Quick Win
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add 3 quantified achievements to boost your impact score to 95+
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                  <BookOpenCheckIcon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Technical Excellence Training
                </h4>
              </div>
              
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Master coding interviews with comprehensive practice and intelligent guidance. 
                Access curated problems, get AI-powered hints, and learn optimal solutions 
                across all difficulty levels.
              </p>
              
              <ul className="space-y-3.5">
                {[
                  "1,000+ hand-picked coding challenges",
                  "Live code execution and testing",
                  "Smart hints that guide without spoiling",
                  "Company-specific interview patterns"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-2xl">
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    Two Sum Problem
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-semibold">
                    Easy
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Given an array of integers nums and an integer target, return 
                  indices of the two numbers that add up to target.
                </p>
                <div className="bg-background/80 rounded-lg p-3 font-mono text-xs border border-border/50">
                  <div className="text-purple-500">def</div>
                  <div className="ml-2">
                    <span className="text-foreground">twoSum</span>
                    <span className="text-muted-foreground">(</span>
                    <span className="text-blue-500">nums, target</span>
                    <span className="text-muted-foreground">):</span>
                  </div>
                  <div className="ml-4 text-muted-foreground/60">
                    # Your solution here
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">
                    3 of 5 test cases passed
                  </span>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Run Tests
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    {
      value: "2.3×",
      label: "Faster placement",
      description:
        "Land offers in 4-6 weeks compared to the industry average of 12+ weeks",
    },
    {
      value: "65%",
      label: "Fewer interviews",
      description:
        "Secure offers in 3-4 interviews vs the typical 8-10 interview grind",
    },
    {
      value: "89%",
      label: "Success rate",
      description:
        "Members who complete our program receive offers at nearly 9/10 interviews",
    },
    {
      value: "$15K+",
      label: "Salary increase",
      description:
        "Better preparation leads to stronger negotiation and higher compensation",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Real results from{" "}
            <span className="text-primary">real professionals</span>
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Our members consistently outperform in every metric that matters
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-2xl bg-card/70 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-base sm:text-lg font-semibold text-foreground mb-3">
                {stat.label}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground mb-8">
            * Based on data from 2,500+ successful placements in 2024
          </p>
          <Button 
            size="lg" 
            className="h-12 px-8 font-semibold shadow-lg hover:shadow-xl" 
            asChild
          >
            <Link href="/app">Join Successful Job Seekers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "IPrepWithAI completely transformed how I approach interviews. The AI sessions felt incredibly realistic—I walked into my Google interview with total confidence. First offer, first try!",
      timeToOffer: "3 weeks",
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager",
      company: "Stripe",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "Behavioral questions used to be my weakness. The AI coach helped me craft compelling narratives and perfect my delivery. Result? Multiple offers to choose from.",
      timeToOffer: "5 weeks",
    },
    {
      name: "Emily Park",
      role: "Data Scientist",
      company: "Netflix",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "The resume analyzer is pure gold. My callback rate tripled after implementing the AI suggestions. Best investment I've made in my career.",
      timeToOffer: "4 weeks",
    },
    {
      name: "Alex Thompson",
      role: "Frontend Developer",
      company: "Airbnb",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "I went from failing coding rounds to acing them consistently. The AI feedback pinpointed exactly where I was going wrong and how to improve.",
      timeToOffer: "2 weeks",
    },
    {
      name: "Priya Patel",
      role: "UX Designer",
      company: "Figma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "Career changing into tech felt overwhelming until I found this platform. The personalized guidance gave me the confidence to pursue design roles at top companies.",
      timeToOffer: "6 weeks",
    },
    {
      name: "David Kim",
      role: "DevOps Engineer",
      company: "AWS",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face&auto=format&q=80",
      content:
        "The negotiation guidance alone was worth 10x the subscription cost. I increased my final offer by $25K just by following the AI's strategic advice.",
      timeToOffer: "4 weeks",
    },
  ];

  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Trusted by <span className="text-primary">10,000+</span> professionals
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands who've accelerated their careers with AI-powered preparation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-border/50 h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 h-full flex flex-col relative">
                <div className="flex items-center gap-3 mb-4">
                  <UserAvatar
                    className="size-12 flex-shrink-0 ring-2 ring-primary/10"
                    user={{
                      imageUrl: testimonial.avatar,
                      name: testimonial.name,
                    }}
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                <blockquote className="text-muted-foreground leading-relaxed mb-4 flex-grow">
                  &quot;{testimonial.content}&quot;
                </blockquote>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="text-sm font-semibold text-primary">
                    @{testimonial.company}
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium">
                    {testimonial.timeToOffer}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6 text-lg">
            Ready to write your success story?
          </p>
          <Button 
            size="lg" 
            className="h-12 px-8 font-semibold shadow-lg hover:shadow-xl" 
            asChild
          >
            <Link href="/app">Begin Your Journey</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Invest in your{" "}
            <span className="text-primary">career success</span>
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible plans designed to accelerate your career goals
          </p>
        </div>

        <div className="max-w-5xl mx-auto">{/* <PricingTable /> */}</div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day money-back guarantee. Cancel anytime, no questions asked.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Instant access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 bg-card border-t border-border/50">
      <div className="container">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-2.5">
            <Brain className="size-7 text-primary" />
            <span className="text-xl font-bold text-foreground">IPrepWithAI</span>
          </div>
          
          <p className="text-center text-muted-foreground max-w-md">
            Empowering professionals worldwide with AI-driven interview preparation and career advancement tools
          </p>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <span className="text-border">•</span>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <span className="text-border">•</span>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground">
            © 2024 IPrepWithAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}