"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? "";
}
export async function requireUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return redirect("/api/auth/signin");
  }

  return session.user.id;
}

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/api/auth/signin");
  }

  return session.user;
}
