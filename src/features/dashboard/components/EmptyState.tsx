"use client";

import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">No interviews found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn't find any interviews matching your search criteria. Try
        adjusting your filters or search query.
      </p>
      <Button onClick={onClearFilters} variant="outline">
        Clear all filters
      </Button>
    </div>
  );
}