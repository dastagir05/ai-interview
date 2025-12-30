"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/signin");
        return;
      }

      if (session?.user) {
        try {
          // Fetch tokens from your backend
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: session.user.name,
                email: session.user.email,
                profilePictureUrl: session.user.imageUrl,
                oauthId: session.user.id,
                oauthProvider: "google", // You may need to track this
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Backend authentication failed");
          }

          const data = await response.json();

          // Store tokens and user data
          login(data.accessToken, data.refreshTokenId, data.user);
        } catch (error) {
          console.error("Authentication error:", error);
          router.push("/signin?error=auth_failed");
        }
      }
    };

    handleCallback();
  }, [session, status, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Signing you in...
        </h2>
        <p className="text-gray-600">Please wait while we verify your account</p>
      </div>
    </div>
  );
}