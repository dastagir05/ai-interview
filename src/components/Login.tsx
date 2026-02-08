"use client";
import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

type LoginProps = {
  openDialog: boolean;
  closeDialog: () => void;
};

type LoginMode = "initial" | "email-input" | "otp-input";

const Login: React.FC<LoginProps> = ({ openDialog, closeDialog }) => {
  const [mode, setMode] = useState<LoginMode>("initial");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (openDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openDialog]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const resetState = () => {
    setMode("initial");
    setEmail("");
    setOtp("");
    setName("");
    setIsNewUser(false);
    setError("");
    setSuccess("");
    setTimer(0);
  };

  const handleClose = () => {
    resetState();
    closeDialog();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/email/check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setIsNewUser(false);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/email/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to send OTP");
        }

        setSuccess("OTP sent to your email!");
        setMode("otp-input");
        setTimer(60);
      } else {
        setIsNewUser(true);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/email/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send OTP");
      }

      setSuccess("OTP sent to your email!");
      setMode("otp-input");
      setTimer(60);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isNewUser
        ? "/api/auth/email/verify-registration"
        : "/api/auth/email/verify-login";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
          credentials: "include", 
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid OTP");
      }

      const data = await response.json();
      console.log("token from registration", data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);
      setSuccess("Login successful! Redirecting...");

      window.location.href = `/api/auth/email/callback?token=${data.accessToken}`;
      
      setTimeout(() => {
        handleClose();
        window.location.reload(); 
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;

    setError("");
    setIsLoading(true);

    try {
      const endpoint = isNewUser
        ? "/api/auth/email/register"
        : "/api/auth/email/login";

      const body = isNewUser
        ? { email, name }
        : { email };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend OTP");
      }

      setSuccess("New OTP sent!");
      setTimer(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  if (!openDialog) return null;

  return (
    <div className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-card text-card-foreground rounded-xl shadow-2xl p-8 w-[90%] max-w-md border border-border">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl font-bold w-8 h-8 rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
          aria-label="Close"
        >
          ×
        </button>

        {mode === "initial" && (
          <>
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
              Welcome to IPrepWithAI
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/google`;
                }}
                className="flex items-center justify-center w-full border border-border bg-background hover:bg-muted rounded-lg px-4 py-3 transition-colors text-foreground font-medium"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt="Google"
                  className="w-5 h-5 mr-3"
                />
                Continue with Google
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow h-px bg-border" />
                <span className="mx-3 text-muted-foreground text-sm">Or</span>
                <div className="flex-grow h-px bg-border" />
              </div>

              <button
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/github`;
                }}
                className="flex items-center justify-center w-full border border-border bg-background hover:bg-muted rounded-lg px-4 py-3 transition-colors text-foreground font-medium"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                  alt="GitHub"
                  className="w-5 h-5 mr-3 dark:invert"
                />
                Continue with GitHub
              </button>

              <button
                onClick={() => setMode("email-input")}
                className="flex items-center justify-center w-full border-2 border-primary bg-primary/5 hover:bg-primary/10 text-primary rounded-lg px-4 py-3 transition-colors font-medium"
              >
                <Mail className="w-5 h-5 mr-3" />
                Continue with Email
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed">
              By proceeding, I agree to{" "}
              <a href="#" className="text-primary hover:underline">
                Terms & Conditions
              </a>
              ,{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>{" "}
              &{" "}
              <a href="#" className="text-primary hover:underline">
                Tariff Rates
              </a>
            </p>
          </>
        )}

        {mode === "email-input" && !isNewUser && (
          <>
            <button
              onClick={() => setMode("initial")}
              className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <h2 className="text-2xl font-bold mb-2 text-foreground">Sign in with Email</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We'll send you a verification code to your email
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </form>
          </>
        )}

        {mode === "email-input" && isNewUser && (
          <>
            <button
              onClick={() => {
                setIsNewUser(false);
                setName("");
              }}
              className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <h2 className="text-2xl font-bold mb-2 text-foreground">Create Your Account</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Welcome! Let's get you set up in seconds
            </p>

            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                readOnly
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-muted-foreground cursor-not-allowed"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
                disabled={isLoading}
              />

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account & Send Code"
                )}
              </button>
            </form>
          </>
        )}

        {mode === "otp-input" && (
          <>
            <button
              onClick={() => setMode("email-input")}
              className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <h2 className="text-2xl font-bold mb-2 text-foreground">Enter Verification Code</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) setOtp(value);
                }}
                placeholder="000000"
                className="w-full bg-background border border-border rounded-lg px-4 py-4 text-center text-3xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
                maxLength={6}
                required
                disabled={isLoading}
              />

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <div className="text-center pt-2">
                {timer > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend code in <span className="font-semibold text-foreground">{timer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;