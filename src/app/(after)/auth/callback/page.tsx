// src/app/auth/callback/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        console.error("OAuth error:", error);
        router.push("/?error=auth_failed");
        return;
      }

      try {
        const response = await fetch("/api/auth/me");

        if (response.ok) {
          const data = await response.json();
          
          if (data.user) {
            if (token) {
              localStorage.setItem("accessToken", token);
            }
            
            await login(token || "", data.user);
            
            router.push("/dashboard");
            return;
          }
        }
      // try {
      //   console.log("i am storing tokne")
      //   const response = await fetch("/api/auth/set-token", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       token: token,
      //     }),
      //   });
      
      //   if (!response.ok) {
      //     throw new Error("Failed to set token");
      //   }
      
      //   const data = await response.json();
      //   console.log("Token stored in cookie:", data);
      // } catch (error) {
      //   console.error(error);
      // }

        if (token) {
          localStorage.setItem("accessToken", token);
          
          const userResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            await login(token, userData);
            router.push("/dashboard");
            return;
          }
        }

        throw new Error("Authentication failed");
      } catch (error) {
        console.error("Error during authentication:", error);
        router.push("/?error=auth_processing_failed");
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}