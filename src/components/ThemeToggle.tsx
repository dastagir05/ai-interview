"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const themes = [
  {
    name: "Light",
    Icon: Sun,
    value: "light",
  },
  {
    name: "Dark",
    Icon: Moon,
    value: "dark",
  },
  {
    name: "System",
    Icon: Monitor,
    value: "system",
  },
] as const;

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-hidden className="pointer-events-none">
        <Sun className="size-[1.125rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {resolvedTheme === "dark" ? <Moon /> : <Sun />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ name, Icon, value }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "cursor-pointer",
              theme === value && "bg-popover opacity-100 backdrop-blur-none"
            )}
          >
            <Icon className="size-4" />
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
