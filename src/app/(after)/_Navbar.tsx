"use client";

import {
  BookOpenIcon,
  Brain,
  FileSlidersIcon,
  SpeechIcon,
  UserIcon,
  BarChart3Icon,
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
import { useAuth } from "@/lib/useAuth";
import { Settings } from "lucide-react";

const navLinks = [
  { name: "JD", href: "/", Icon: FileSlidersIcon },
  { name: "Interviews", href: "interviews", Icon: SpeechIcon },
  { name: "Questions", href: "questions", Icon: BookOpenIcon },
];
const navLinks1 = [
  { name: "Dashboard", href: "/dashboard", Icon: SpeechIcon },
  { name: "Personal Jobs", href: "/personalJob", Icon: BookOpenIcon },
  { name: "Resume", href: "resume", Icon: FileSlidersIcon },
  { name: "Analytics", href: "analytics", Icon: BarChart3Icon },
  { name: "User", href: "user", Icon: UserIcon },
];

export function Navbar({
  user,
}: {
  user: { name?: string; image?: string } | null | undefined;
}) {
  const { jobInfoId } = useParams();
  const { logout, isAdmin } = useAuth();
  const pathName = usePathname();

  return (
    <nav className="h-header border-b p-4">
      <div className="container flex h-full items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Brain className="size-8 text-primary" />
          <span className="text-xl font-bold">IPrepWithAI</span>
        </Link>

        <div className="flex items-center gap-4">
          {typeof jobInfoId !== "string" &&
            navLinks1.map(({ name, href, Icon }) => {
              const hrefPath = `${href}`;

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
          {typeof jobInfoId === "string" &&
            navLinks.map(({ name, href, Icon }) => {
              const hrefPath = `/job-infos/${jobInfoId}/${href}`;

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

          {isAdmin && (
            <Button
              variant={pathName?.startsWith("/admin") ? "secondary" : "ghost"}
              asChild
              className="cursor-pointer"
            >
              <Link href="/admin/dashboard">
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}

          <ThemeToggle />


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
                onClick={() => logout()}
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
