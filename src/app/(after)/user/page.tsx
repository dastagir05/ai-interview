"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRouteProps";
import { toast } from "sonner";
import { UserDetails } from "@/data/type/user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loading } from "@/components/Loading";

export default function UserSettingsPage() {
  return (
    <ProtectedRoute>
      <UserSettingsContent />
    </ProtectedRoute>
  );
}

function UserSettingsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEmailChangeDialogOpen, setIsEmailChangeDialogOpen] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
  });

  const [emailChangeForm, setEmailChangeForm] = useState({
    newEmail: "",
    otp: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user profile
  const fetchUserProfile = async (): Promise<UserDetails> => {
    const res = await fetch(`/api/users/me`);
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  };

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });

  // Update profile form when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
      });
    }
  }, [user]);

  // Update profile mutation (name only)
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { name: string }) => {
      const res = await fetch(`/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Initiate email change mutation
  const initiateEmailChangeMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      const res = await fetch(`/api/users/change-email/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newEmail }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to initiate email change");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Verification code sent to your new email");
      setEmailOtpSent(true);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send verification code");
    },
  });

  // Verify email change mutation
  const verifyEmailChangeMutation = useMutation({
    mutationFn: async (payload: { newEmail: string; otp: string }) => {
      const res = await fetch(`/api/users/change-email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Email verification failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Email changed successfully");
      setIsEmailChangeDialogOpen(false);
      setEmailOtpSent(false);
      setEmailChangeForm({ newEmail: "", otp: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify email change");
    },
  });

  // Initiate password change mutation
  const initiatePasswordChangeMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`/api/users/change-password/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to request OTP");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("OTP sent to your email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send OTP");
    },
  });

  // Verify password change mutation
  const verifyPasswordChangeMutation = useMutation({
    mutationFn: async (payload: { otp: string; newPassword: string }) => {
      const res = await fetch(`/api/users/change-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Password change failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswordForm({ otp: "", newPassword: "", confirmPassword: "" });
      setIsPasswordOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/me`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Delete failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.info("Account deleted successfully");
      queryClient.clear();
      router.push("/");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account");
    },
  });

  // Handle profile update
  const handleUpdateProfile = () => {
    if (!profileForm.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateProfileMutation.mutate({ name: profileForm.name });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (user) {
      setProfileForm({
        name: user.name || "",
      });
    }
    setIsEditingProfile(false);
  };

  // Handle email change initiation
  const handleInitiateEmailChange = () => {
    if (!emailChangeForm.newEmail.trim()) {
      toast.error("Please enter a new email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailChangeForm.newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (emailChangeForm.newEmail === user?.email) {
      toast.error("New email cannot be the same as current email");
      return;
    }
    initiateEmailChangeMutation.mutate(emailChangeForm.newEmail);
  };

  // Handle email change verification
  const handleVerifyEmailChange = () => {
    if (!emailChangeForm.otp.trim()) {
      toast.error("Please enter the verification code");
      return;
    }
    verifyEmailChangeMutation.mutate({
      newEmail: emailChangeForm.newEmail,
      otp: emailChangeForm.otp,
    });
  };

  // Handle password change initiation
  const handleRequestPasswordOTP = () => {
    if (!user?.email) {
      toast.error("Email not found");
      return;
    }
    initiatePasswordChangeMutation.mutate(user.email);
  };

  // Handle password change
  const handleChangePassword = () => {
    if (!passwordForm.otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    verifyPasswordChangeMutation.mutate({
      otp: passwordForm.otp,
      newPassword: passwordForm.newPassword,
    });
  };

  // Handle subscription upgrade
  const handleUpgrade = (tier: string) => {
    router.push(`/upgrade`);
  };

  // Handle close email dialog
  const handleCloseEmailDialog = () => {
    setIsEmailChangeDialogOpen(false);
    setEmailOtpSent(false);
    setEmailChangeForm({ newEmail: "", otp: "" });
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
      price: "₹499",
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
      price: "₹4999",
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

  // Mock usage data
  const usage = {
    interviews: {
      used: 7,
      limit: user?.tier === "PRO" ? 999 : user?.tier === "BASIC" ? 10 : 3,
    },
    jobPosts: {
      used: 3,
      limit: user?.tier === "PRO" ? 999 : user?.tier === "BASIC" ? 5 : 1,
    },
    aiMinutes: {
      used: 85,
      limit: user?.tier === "PRO" ? 999 : user?.tier === "BASIC" ? 120 : 30,
    },
  };

  if (isLoadingUser) {
    return <Loading name="Loading User Data" />;
  }

  if (userError || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">Failed to load user data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-2 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-semibold ring-2 ring-primary/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, security, and subscription
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile"
           className="
           mr-2
           data-[state=active]:bg-background
           data-[state=active]:text-foreground
           data-[state=active]:shadow-sm
         "
          >
            <User className="h-4 w-4 mr-2" />
            Profile & Security
          </TabsTrigger>
          <TabsTrigger value="subscription"
           className="
           data-[state=active]:bg-background
           data-[state=active]:text-foreground
           data-[state=active]:shadow-sm
         "
          >
            <Crown className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
          <Card className="gap-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {isEditingProfile
                    ? "Update your personal information"
                    : "View your account details"}
                </CardDescription>
              </div>
              {!isEditingProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditingProfile ? (
                // View Mode
                <>
                  <div className="space-y-4">
                    {/* Name Display */}
                    <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">
                          Full Name
                        </Label>
                        <p className="text-base font-medium mt-1 break-words">
                          {user.name || "Not set"}
                        </p>
                      </div>
                    </div>

                    {/* Email Display */}
                    <div
                      className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted"
                      onClick={() => setIsEmailChangeDialogOpen(true)}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">
                          Email Address
                        </Label>
                        <p className="text-base font-medium mt-1 break-all">
                          {user.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEmailChangeDialogOpen(true)}
                        className="flex-shrink-0"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    </div>

                    <Separator />

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Member Since
                          </Label>
                          <p className="text-sm font-medium mt-1">
                            {new Date(user.createdAt || Date.now()).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                        <Award className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Achievements
                          </Label>
                          <p className="text-sm font-medium mt-1">
                            {user.totalAchievements || 0} badges earned
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Edit Mode (Name only)
                <>
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, name: e.target.value })
                        }
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
                      <p className="text-muted-foreground">
                        To change your email address, please use the "Change" button
                        next to your email in view mode.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updateProfileMutation.isPending}
                      className="flex-1"
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={updateProfileMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Collapsible open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
            <Card className="gap-0 ">
              <CollapsibleTrigger className="w-full space-y-0 pb-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pb-2">
                  <div className="text-left">
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </div>
                  {isPasswordOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-0">
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm">
                    <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">
                        Security Verification Required
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        We'll send a one-time password to your email ({user.email}) to
                        verify it's you.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password-otp">One-Time Password (OTP)</Label>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleRequestPasswordOTP}
                        disabled={initiatePasswordChangeMutation.isPending}
                        className="h-auto p-0"
                      >
                        {initiatePasswordChangeMutation.isPending ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : null}
                        Request OTP
                      </Button>
                    </div>
                    <Input
                      id="password-otp"
                      type="text"
                      value={passwordForm.otp}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          otp: e.target.value,
                        })
                      }
                      placeholder="Enter OTP from email"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password (min. 8 characters)"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={verifyPasswordChangeMutation.isPending}
                    className="w-full"
                  >
                    {verifyPasswordChangeMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Danger Zone */}
          <Card className="border-destructive gap-0">
            <CardHeader className="px-6 pb-2">
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
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
                      onClick={() => deleteAccountMutation.mutate()}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={deleteAccountMutation.isPending}
                    >
                      {deleteAccountMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
        {/* Subscription Tab - DROP IN REPLACEMENT for TabsContent value="subscription" */}
<TabsContent value="subscription" className="space-y-6">

{/* Current Plan - Hero Card */}
<div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-0.5">
  <div className="relative rounded-[14px] bg-background overflow-hidden">
    {/* Decorative background blobs */}
    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

    <div className="relative p-6 space-y-6">
      {/* Plan header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Active Plan</p>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-bold tracking-tight">
              {tiers[user.tier as keyof typeof tiers]?.name || "Free"}
            </h3>
            <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
              Active
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            <span className="text-xl font-bold text-foreground">
              {tiers[user.tier as keyof typeof tiers]?.price || "₹0"}
            </span>
            {" "}/ {tiers[user.tier as keyof typeof tiers]?.period || "forever"}
          </p>
        </div>

        {/* Plan icon visual */}
        <div className="relative flex-shrink-0">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          {user.tier === "PRO" && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <Separator className="opacity-50" />

      {/* Usage Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">This Month's Usage</h4>
          {user.tier !== "PRO" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Resets on 1st
            </span>
          )}
        </div>

        {/* Interview usage */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Mock Interviews</span>
            </div>
            <span className="font-semibold tabular-nums">
              {usage.interviews.used}
              <span className="text-muted-foreground font-normal">
                {" "}/ {usage.interviews.limit === 999 ? "∞" : usage.interviews.limit}
              </span>
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
              style={{ width: `${Math.min((usage.interviews.used / usage.interviews.limit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Job postings usage */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500" />
              <span className="text-muted-foreground">Job Postings</span>
            </div>
            <span className="font-semibold tabular-nums">
              {usage.jobPosts.used}
              <span className="text-muted-foreground font-normal">
                {" "}/ {usage.jobPosts.limit === 999 ? "∞" : usage.jobPosts.limit}
              </span>
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-700"
              style={{ width: `${Math.min((usage.jobPosts.used / usage.jobPosts.limit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* AI minutes usage */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">AI Minutes</span>
            </div>
            <span className="font-semibold tabular-nums">
              {usage.aiMinutes.used}
              <span className="text-muted-foreground font-normal">
                {" "}/ {usage.aiMinutes.limit === 999 ? "∞" : usage.aiMinutes.limit}
              </span>
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.min((usage.aiMinutes.used / usage.aiMinutes.limit) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Upgrade CTA inside card if not PRO */}
      {user.tier !== "PRO" && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            Upgrade to <span className="font-semibold text-foreground">Pro</span> for unlimited access
          </p>
          <Button size="sm" onClick={() => handleUpgrade("PRO")} className="shrink-0 h-7 text-xs">
            Upgrade
          </Button>
        </div>
      )}
    </div>
  </div>
</div>

{/* Upgrade Plans */}
{user.tier !== "PRO" && (
  <Card className="gap-0">
    <CardHeader className="px-6 pb-2">
      <CardTitle>Upgrade Your Plan</CardTitle>
      <CardDescription>Choose a plan that fits your needs</CardDescription>
    </CardHeader>
    <CardContent className="px-6 pt-0">
      <div className="grid md:grid-cols-2 gap-4">
        {user.tier === "FREE" && (
          <>
            {/* BASIC Plan */}
            <div className="border rounded-xl p-5 space-y-4 hover:border-primary/40 hover:shadow-sm transition-all">
              <div>
                <h3 className="text-lg font-bold">Basic</h3>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-3xl font-bold">₹299</span>
                  <span className="text-muted-foreground text-sm mb-1">/month</span>
                </div>
              </div>
              <ul className="space-y-2">
                {tiers.BASIC.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => handleUpgrade("BASIC")} className="w-full" variant="outline">
                Upgrade to Basic
              </Button>
            </div>

            {/* PRO Plan */}
            <div className="relative border-2 border-primary rounded-xl p-5 space-y-4 bg-primary/[0.02] hover:shadow-md transition-all">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Most Popular
              </Badge>
              <div>
                <h3 className="text-lg font-bold">Pro</h3>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-3xl font-bold">₹999</span>
                  <span className="text-muted-foreground text-sm mb-1">/month</span>
                </div>
              </div>
              <ul className="space-y-2">
                {tiers.PRO.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => handleUpgrade("PRO")} className="w-full">
                Upgrade to Pro
              </Button>
            </div>
          </>
        )}

        {user.tier === "BASIC" && (
          <div className="border-2 border-primary rounded-xl p-5 space-y-4 relative bg-primary/[0.02] max-w-md mx-auto w-full">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              Recommended
            </Badge>
            <div>
              <h3 className="text-lg font-bold">Pro</h3>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-3xl font-bold">₹999</span>
                <span className="text-muted-foreground text-sm mb-1">/month</span>
              </div>
            </div>
            <ul className="space-y-2">
              {tiers.PRO.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button onClick={() => handleUpgrade("PRO")} className="w-full">
              Upgrade to Pro
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)}

{/* Manage Subscription */}
{user.tier !== "FREE" && (
  <Card>
    <CardHeader>
      <CardTitle>Manage Subscription</CardTitle>
      <CardDescription>Payment and subscription management coming soon</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Button variant="outline" className="w-full" disabled>
        <CreditCard className="h-4 w-4 mr-2" />
        Update Payment Method
      </Button>
      <Button variant="outline" className="w-full" disabled>
        Cancel Subscription
      </Button>
    </CardContent>
  </Card>
)}
</TabsContent>
      </Tabs>

      {/* Email Change Dialog */}
      <Dialog
        open={isEmailChangeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseEmailDialog();
          } else {
            setIsEmailChangeDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-md z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              {!emailOtpSent
                ? "Enter your new email address."
                : "Enter the verification code sent to your new email address."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!emailOtpSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email Address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={emailChangeForm.newEmail}
                    onChange={(e) =>
                      setEmailChangeForm({
                        ...emailChangeForm,
                        newEmail: e.target.value,
                      })
                    }
                    placeholder="your.new@email.com"
                  />
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-700 dark:text-blue-300">
                    A verification code will be sent to this new email address.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email-otp">Verification Code</Label>
                  <Input
                    id="email-otp"
                    type="text"
                    value={emailChangeForm.otp}
                    onChange={(e) =>
                      setEmailChangeForm({
                        ...emailChangeForm,
                        otp: e.target.value,
                      })
                    }
                    placeholder="Enter 6-digit code"
                  />
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-700 dark:text-amber-300">
                      Check your inbox at{" "}
                      <span className="font-medium">{emailChangeForm.newEmail}</span>
                    </p>
                    <button
                      onClick={() => setEmailOtpSent(false)}
                      className="text-amber-600 dark:text-amber-400 hover:underline mt-1"
                    >
                      Change email address
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="sm:space-x-2">
            <Button variant="outline" onClick={handleCloseEmailDialog}>
              Cancel
            </Button>
            {!emailOtpSent ? (
              <Button
                onClick={handleInitiateEmailChange}
                disabled={initiateEmailChangeMutation.isPending}
              >
                {initiateEmailChangeMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Send Code
              </Button>
            ) : (
              <Button
                onClick={handleVerifyEmailChange}
                disabled={verifyEmailChangeMutation.isPending}
              >
                {verifyEmailChangeMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Verify & Change Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>

      </Dialog>
    </div>
  );
}