"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Crown,
  CreditCard,
  Check,
  Loader2,
  Trash2,
  Calendar,
  Award,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRouteProps";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function UserSettingsPage() {
  return (
    <ProtectedRoute>
      <UserSettingsContent />
    </ProtectedRoute>
  );
}

function UserSettingsContent() {
  const router = useRouter();
  const [open, setOpen] = useState(false)
  
  const [user, setUser] = useState({
    id: "user-123",
    name: "John Doe",
    email: "john.doe@example.com",
    subscriptionTier: "BASIC", // FREE, BASIC, PRO
    memberSince: "2024-01-15",
    totalAchievements: 4,
  });

  // Subscription usage stats
  const [usage, setUsage] = useState({
    interviews: { used: 7, limit: 10 },
    jobPosts: { used: 3, limit: 5 },
    aiMinutes: { used: 85, limit: 120 },
  });

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle profile update
  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add auth token from your auth context/cookie
        },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setUser({ ...user, name: data.name, email: data.email });
      toast.success("Your profile has been updated successfully.");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.",);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) throw new Error("Failed to change password");

      toast.success("Your password has been changed successfully.");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to change password. Please check your current password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete account");

      toast.info("Your account has been permanently deleted.");
      // Redirect to login or home page
      router.push("/");
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Handle subscription upgrade
  const handleUpgrade = (tier: string) => {
    // Redirect to payment page or trigger Razorpay
    router.push(`/checkout?plan=${tier}`);
  };

  // Subscription tier details
  const tiers = {
    FREE: {
      name: "Free",
      price: "₹0",
      period: "forever",
      features: [
        "3 mock interviews per month",
        "1 job posting",
        "30 AI minutes",
        "Basic analytics",
      ],
    },
    BASIC: {
      name: "Basic",
      price: "₹299",
      period: "per month",
      features: [
        "10 mock interviews per month",
        "5 job postings",
        "120 AI minutes",
        "Detailed skill breakdown",
        "Performance trends",
        "Email support",
      ],
    },
    PRO: {
      name: "Pro",
      price: "₹999",
      period: "per month",
      features: [
        "Unlimited mock interviews",
        "Unlimited job postings",
        "Unlimited AI minutes",
        "All analytics features",
        "Personalized insights",
        "Export reports",
        "Priority support",
        "Early access to features",
      ],
    },
  };

  return (
    <div className="container my-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and subscription
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile & Security</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    className="pl-9"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-9"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Member Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.memberSince).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-10" />
                <Separator className="sm:hidden" />
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Achievements</p>
                    <p className="text-xs text-muted-foreground">
                      {user.totalAchievements} badges earned
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto"
              >
                {isUpdatingProfile && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <Collapsible open={open} onOpenChange={setOpen}>
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription className="py-4">
                    Update your password to keep your account secure
                    </CardDescription>
                </div>

                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon">
                    {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
                <CardContent className="space-y-4">

                    {/* Current Password */}
                    <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        className="pl-9"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                            setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                            })
                        }
                        />
                    </div>

                    {/* 🔗 Forgot password link */}
                    <button
                        type="button"
                        onClick={() => router.push("/forgot-password")}
                        className="text-xs text-primary hover:underline mt-1"
                    >
                        Forgot current password?
                    </button>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        className="pl-9"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                            setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                            })
                        }
                        />
                    </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        className="pl-9"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                            setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                            })
                        }
                        />
                    </div>
                    </div>

                    <Button
                    onClick={handleChangePassword}
                    disabled={isUpdatingPassword}
                    className="w-full sm:w-auto"
                    >
                    {isUpdatingPassword && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                    </Button>

                </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove all your data from our servers,
                      including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All interview history and recordings</li>
                        <li>Performance analytics and insights</li>
                        <li>Job postings and applications</li>
                        <li>Achievements and badges</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={isDeletingAccount}
                    >
                      {isDeletingAccount && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription and view usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-2 rounded-lg bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-bold">
                      {tiers[user.subscriptionTier as keyof typeof tiers].name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">Current Plan</Badge>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {tiers[user.subscriptionTier as keyof typeof tiers].price} /{" "}
                    {tiers[user.subscriptionTier as keyof typeof tiers].period}
                  </p>
                </div>
                <Crown className="h-10 w-10 sm:h-12 sm:w-12 text-primary flex-shrink-0" />
              </div>

              {/* Usage Stats */}
              <div className="space-y-5">
                <h4 className="font-semibold text-lg">Usage This Month</h4>

                {/* Interviews */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Mock Interviews</span>
                    <span className="font-semibold">
                      {usage.interviews.used} / {usage.interviews.limit === 999 ? "∞" : usage.interviews.limit}
                    </span>
                  </div>
                  <Progress
                    value={
                      usage.interviews.limit === 999
                        ? 0
                        : (usage.interviews.used / usage.interviews.limit) * 100
                    }
                    className="h-2"
                  />
                </div>

                {/* Job Posts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Job Postings</span>
                    <span className="font-semibold">
                      {usage.jobPosts.used} / {usage.jobPosts.limit === 999 ? "∞" : usage.jobPosts.limit}
                    </span>
                  </div>
                  <Progress
                    value={
                      usage.jobPosts.limit === 999
                        ? 0
                        : (usage.jobPosts.used / usage.jobPosts.limit) * 100
                    }
                    className="h-2"
                  />
                </div>

                {/* AI Minutes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">AI Minutes</span>
                    <span className="font-semibold">
                      {usage.aiMinutes.used} / {usage.aiMinutes.limit === 999 ? "∞" : usage.aiMinutes.limit}
                    </span>
                  </div>
                  <Progress
                    value={
                      usage.aiMinutes.limit === 999
                        ? 0
                        : (usage.aiMinutes.used / usage.aiMinutes.limit) * 100
                    }
                    className="h-2"
                  />
                </div>
              </div>

              {user.subscriptionTier !== "PRO" && (
                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  💡 Usage resets on the 1st of every month
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Plans */}
          {user.subscriptionTier !== "PRO" && (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
                <CardDescription>
                  Choose a plan that fits your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {user.subscriptionTier === "FREE" && (
                    <>
                      {/* BASIC Plan */}
                      <div className="border-2 rounded-xl p-6 space-y-5 hover:shadow-lg transition-shadow bg-card">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">Basic</h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">₹299</span>
                            <span className="text-muted-foreground text-lg">/month</span>
                          </div>
                        </div>
                        <ul className="space-y-3 pt-2">
                          {tiers.BASIC.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm">
                              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => handleUpgrade("BASIC")}
                          className="w-full mt-6"
                          variant="outline"
                        >
                          Upgrade to Basic
                        </Button>
                      </div>

                      {/* PRO Plan */}
                      <div className="border-2 border-primary rounded-xl p-6 space-y-5 relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-xl transition-all">
                        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">Pro</h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">₹999</span>
                            <span className="text-muted-foreground text-lg">/month</span>
                          </div>
                        </div>
                        <ul className="space-y-3 pt-2">
                          {tiers.PRO.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm">
                              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => handleUpgrade("PRO")}
                          className="w-full mt-6"
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </>
                  )}

                  {user.subscriptionTier === "BASIC" && (
                    <div className="border-2 border-primary rounded-xl p-6 space-y-5 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-xl transition-all max-w-2xl mx-auto lg:max-w-none">
                      <Badge className="bg-primary text-primary-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Pro</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">₹999</span>
                          <span className="text-muted-foreground text-lg">/month</span>
                        </div>
                      </div>
                      <ul className="space-y-3 pt-2">
                        {tiers.PRO.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleUpgrade("PRO")}
                        className="w-full mt-6"
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manage Subscription */}
          {user.subscriptionTier !== "FREE" && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Method
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancel Subscription
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}