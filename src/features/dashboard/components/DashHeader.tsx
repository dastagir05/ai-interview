"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilters: string[];
  setActiveFilters: (filters: string[] | ((prev: string[]) => string[])) => void;
}

const FILTER_OPTIONS = [
  "All",
  "Junior",
  "Senior",
  "Programming",
  "Framework",
  "System Design",
  "Java",
  "Python",
  "JavaScript",
  "Spring Boot",
  "MERN",
];

export function DashboardHeader({
  searchQuery,
  setSearchQuery,
  activeFilters,
  setActiveFilters,
}: DashboardHeaderProps) {
  const toggleFilter = (filter: string) => {
    if (filter === "All") {
      setActiveFilters([]);
      return;
    }

    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const isActive = (filter: string) => {
    if (filter === "All") return activeFilters.length === 0;
    return activeFilters.includes(filter);
  };

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search: Spring Boot, Java Senior, MERN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((filter) => (
            <Badge
              key={filter}
              variant={isActive(filter) ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-700 hover:text-white transition-colors px-4 py-1.5"
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}