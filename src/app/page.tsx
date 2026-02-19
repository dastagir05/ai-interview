"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "../components/Landing";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {  
      if (user) {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  return <LandingPage />;
}
