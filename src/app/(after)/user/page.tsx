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

  // Form states
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
    console.log("user in effect", user)
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and subscription
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile & Security
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <Crown className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
          <Card>
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
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
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
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm">
                    <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
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
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription and view usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 rounded-lg bg-primary/5 border-2 border-primary/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">
                      {tiers[user.tier as keyof typeof tiers]?.name || "Free"}
                    </h3>
                    <Badge variant="secondary">Current Plan</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {tiers[user.tier as keyof typeof tiers]?.price || "₹0"} /{" "}
                    {tiers[user.tier as keyof typeof tiers]?.period || "forever"}
                  </p>
                </div>
                <Crown className="h-12 w-12 text-primary" />
              </div>

              {/* Usage Stats */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold">Usage This Month</h4>

                {/* Interviews */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mock Interviews</span>
                    <span className="font-medium">
                      {usage.interviews.used} /{" "}
                      {usage.interviews.limit === 999 ? "∞" : usage.interviews.limit}
                    </span>
                  </div>
                  <Progress
                    value={
                      (usage.interviews.used / usage.interviews.limit) * 100
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Job Postings</span>
                    <span className="font-medium">
                      {usage.jobPosts.used} /{" "}
                      {usage.jobPosts.limit === 999 ? "∞" : usage.jobPosts.limit}
                    </span>
                  </div>
                  <Progress
                    value={(usage.jobPosts.used / usage.jobPosts.limit) * 100}
                  />
                </div>

                {/* AI Minutes */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">AI Minutes</span>
                    <span className="font-medium">
                      {usage.aiMinutes.used} /{" "}
                      {usage.aiMinutes.limit === 999 ? "∞" : usage.aiMinutes.limit}
                    </span>
                  </div>
                  <Progress
                    value={(usage.aiMinutes.used / usage.aiMinutes.limit) * 100}
                  />
                </div>

                {user.tier !== "PRO" && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-sm">
                    <Sparkles className="h-4 w-4 flex-shrink-0" />
                    <p>💡 Usage resets on the 1st of every month</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Plans */}
          {user.tier !== "PRO" && (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Your Plan {user.tier}</CardTitle>
                <CardDescription>Choose a plan that fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {user.tier === "FREE" && (
                    <>
                      {/* BASIC Plan */}
                      <div className="border rounded-lg p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold">Basic</h3>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">₹299</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {tiers.BASIC.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
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
                      <div className="border-2 border-primary rounded-lg p-6 space-y-4 relative">
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                          Popular
                        </Badge>
                        <div>
                          <h3 className="text-xl font-bold">Pro</h3>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">₹999</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {tiers.PRO.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
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

                  {user.tier === "BASIC" && (
                    <div className="border-2 border-primary rounded-lg p-6 space-y-4 relative max-w-md mx-auto w-full">
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Recommended
                      </Badge>
                      <div>
                        <h3 className="text-xl font-bold">Pro</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">₹999</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {tiers.PRO.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
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

          {/* Manage Subscription - Placeholder for future API */}
          {user.tier !== "FREE" && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Subscription</CardTitle>
                <CardDescription>
                  Payment and subscription management coming soon
                </CardDescription>
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