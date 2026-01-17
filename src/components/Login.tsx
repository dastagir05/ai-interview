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
    <div className="fixed h-screen inset-0 z-50 flex items-center justify-center text-black bg-white/30 backdrop-blur-xs">
      <div className="relative bg-white rounded-lg shadow-md p-6 w-[90%] max-w-sm">
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 text-black text-xl font-bold w-6 h-6 rounded"
        >
          ×
        </button>

        {mode === "initial" && (
          <>
            <h2 className="text-4xl font-bold mb-8 py-2 text-center">
              Welcome to IPrepWithAI
            </h2>

            <button
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/google`;
              }}
              className="flex items-center justify-center w-full border rounded px-4 py-2 hover:bg-gray-100"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </button>

            <div className="flex items-center my-2">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="mx-2 text-gray-500">Or</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            <button
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/github`;
              }}
              className="flex items-center justify-center w-full border rounded px-4 py-2 mb-3 hover:bg-gray-100"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                alt="GitHub"
                className="w-5 h-5 mr-2"
              />
              Continue with GitHub
            </button>

            <button
              onClick={() => setMode("email-input")}
              className="flex items-center justify-center w-full border border-blue-500 text-blue-600 rounded px-4 py-2 hover:bg-blue-50"
            >
              <Mail className="w-5 h-5 mr-2" />
              Continue with Email
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By proceeding, I agree to{" "}
              <a href="#" className="text-blue-600 underline">
                T&C
              </a>
              ,{" "}
              <a href="#" className="text-blue-600 underline">
                Privacy Policy
              </a>{" "}
              &{" "}
              <a href="#" className="text-blue-600 underline">
                Tariff Rates
              </a>
            </p>
          </>
        )}

        {mode === "email-input" && !isNewUser && (
          <>
            <button
              onClick={() => setMode("initial")}
              className="flex items-center text-gray-600 mb-4 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            <h2 className="text-2xl font-bold mb-2">Sign in with Email</h2>
            <p className="text-sm text-gray-600 mb-6">
              We'll send you a code to verify your email
            </p>

            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center disabled:bg-gray-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Code"
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
              className="flex items-center text-gray-600 mb-4 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            <h2 className="text-2xl font-bold mb-2">Create Account</h2>
            <p className="text-sm text-gray-600 mb-6">
              Looks like you're new! Let's set up your account
            </p>

            <form onSubmit={handleRegistrationSubmit}>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full border rounded px-4 py-2 mb-3 bg-gray-100"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full border rounded px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center disabled:bg-gray-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
              className="flex items-center text-gray-600 mb-4 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            <h2 className="text-2xl font-bold mb-2">Enter Verification Code</h2>
            <p className="text-sm text-gray-600 mb-6">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>

            <form onSubmit={handleOtpSubmit}>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) setOtp(value);
                }}
                placeholder="000000"
                className="w-full border rounded px-4 py-3 mb-4 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
                required
                disabled={isLoading}
              />

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center disabled:bg-gray-400 mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend code in {timer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-blue-600 hover:underline"
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