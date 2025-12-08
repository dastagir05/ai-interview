import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "./_Navbar";
import { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getAuthSession(); // do api call to backend

  // Redirect logic on server
  if (!session) {
    redirect("/");
  }

  return (
    <>
      <Navbar
        user={
          session?.user
            ? {
                name: session.user.name ?? undefined,
                image: session.user.imageUrl ?? undefined,
              }
            : undefined
        }
      />

      {children}
    </>
  );
}
