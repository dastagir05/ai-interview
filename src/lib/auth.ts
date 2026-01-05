"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {env} from "@/data/env/server";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  imageUrl: string | null;
}

export async function getAuthSession(): Promise<{ user: User } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) {
    return null;
  }

  try {
    // Verify token with backend and get user info
    const response = await fetch(`${env.BACKEND_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return { user };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUserId(): Promise<string> {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  return session.user.id;
}

export async function requireUserId() {
  return getCurrentUserId();
}

export async function requireUser() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/signin");
  }

  return session.user;
}