import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "./_Navbar";
import { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getAuthSession();

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

// "use client";
// import { useRouter } from "next/navigation";
// import { ReactNode, useEffect } from "react";
// import { Navbar } from "./_Navbar";
// import { useSession } from "next-auth/react";

// export default function AppLayout({ children }: { children: ReactNode }) {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "authenticated") return router.replace("/dashboard");
//     if (status === "unauthenticated") return router.replace("/");
//   }, [status, router]);

//   return (
//     <>
//       <Navbar
//         user={
//           session?.user
//             ? {
//                 name: session.user.name ?? undefined,
//                 image: session.user.imageUrl ?? undefined,
//               }
//             : undefined
//         }
//       />
//       {children}
//     </>
//   );
// }
