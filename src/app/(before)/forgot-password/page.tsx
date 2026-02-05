"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Shield, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initiate forgot password mutation
  const initiateForgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`/api/users/forgot-password/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send OTP");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("OTP sent to your email");
      setStep("otp");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send OTP");
    },
  });

  // Verify forgot password mutation
  const verifyForgotPasswordMutation = useMutation({
    mutationFn: async (payload: { email: string; otp: string; newPassword: string }) => {
      const res = await fetch(`/api/users/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Password reset failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password reset successful!");
      setStep("success");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });

  // Handle send OTP
  const handleSendOTP = () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    initiateForgotPasswordMutation.mutate(email);
  };

  // Handle reset password
  const handleResetPassword = () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    verifyForgotPasswordMutation.mutate({
      email,
      otp,
      newPassword,
    });
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    initiateForgotPasswordMutation.mutate(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <Link href="/login">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {step === "email" && "Forgot Password"}
              {step === "otp" && "Verify OTP"}
              {step === "success" && "Password Reset Successful"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === "email" &&
                "Enter your email address and we'll send you a code to reset your password"}
              {step === "otp" && "Enter the code we sent to your email"}
              {step === "success" && "You can now login with your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Email Input */}
            {step === "email" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                  />
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-700 dark:text-blue-300">
                    We'll send a verification code to this email address.
                  </p>
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={initiateForgotPasswordMutation.isPending}
                  className="w-full"
                >
                  {initiateForgotPasswordMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Send Verification Code
                </Button>
              </>
            )}

            {/* Step 2: OTP & New Password */}
            {step === "otp" && (
              <>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm mb-4">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-amber-900 dark:text-amber-100 font-medium">
                      Code sent to
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      {email}
                    </p>
                    <button
                      onClick={() => setStep("email")}
                      className="text-amber-600 dark:text-amber-400 hover:underline text-sm mt-1"
                    >
                      Change email address
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleResendOTP}
                      disabled={initiateForgotPasswordMutation.isPending}
                      className="h-auto p-0 text-xs"
                    >
                      {initiateForgotPasswordMutation.isPending ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : null}
                      Resend Code
                    </Button>
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password (min. 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  />
                </div>

                <Button
                  onClick={handleResetPassword}
                  disabled={verifyForgotPasswordMutation.isPending}
                  className="w-full"
                >
                  {verifyForgotPasswordMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Reset Password
                </Button>
              </>
            )}

            {/* Step 3: Success */}
            {step === "success" && (
              <>
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg">Password Reset Successful!</h3>
                    <p className="text-sm text-muted-foreground">
                      Redirecting you to login page...
                    </p>
                  </div>
                </div>

                <Button onClick={() => router.push("/login")} className="w-full">
                  Go to Login
                </Button>
              </>
            )}

            {/* Divider - only show in email and otp steps */}
            {step !== "success" && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Need help?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}