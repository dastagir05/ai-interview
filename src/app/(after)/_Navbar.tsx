"use client";

import {
  BookOpenIcon,
  BrainCircuitIcon,
  FileSlidersIcon,
  SpeechIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navLinks = [
  { name: "Interviews", href: "interviews", Icon: SpeechIcon },
  { name: "Questions", href: "questions", Icon: BookOpenIcon },
  { name: "Resume", href: "resume", Icon: FileSlidersIcon },
];

export function Navbar({
  user,
}: {
  user: { name?: string; image?: string } | null | undefined;
}) {
  const { jobInfoId } = useParams();
  const pathName = usePathname();

  return (
    <nav className="h-header border-b">
      <div className="container flex h-full items-center justify-between">
        <Link href="/app" className="flex items-center gap-2">
          <BrainCircuitIcon className="size-8 text-primary" />
          <span className="text-xl font-bold">Landr</span>
        </Link>

        <div className="flex items-center gap-4">
          {typeof jobInfoId === "string" &&
            navLinks.map(({ name, href, Icon }) => {
              const hrefPath = `/app/job-infos/${jobInfoId}/${href}`;

              return (
                <Button
                  variant={pathName === hrefPath ? "secondary" : "ghost"}
                  key={name}
                  asChild
                  className="cursor-pointer max-sm:hidden"
                >
                  <Link href={hrefPath}>
                    <Icon className="mr-2" />
                    {name}
                  </Link>
                </Button>
              );
            })}

          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserAvatar
                user={{
                  name: user?.name ?? "User",
                  imageUrl: user?.image ?? undefined,
                }}
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-2">
              <button
                className="w-full bg-red-500 text-white px-3 py-2 cursor-pointer rounded text-sm hover:bg-red-700 transition-colors"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
