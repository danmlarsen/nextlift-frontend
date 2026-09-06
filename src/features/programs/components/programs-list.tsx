"use client";

import InfiniteScroll from "react-infinite-scroller";

import { useInfinitePrograms } from "@/api/programs/queries";
import { type ProgramsQueryFilters } from "@/api/programs/types";
import ProgramCard, { ProgramCardSkeleton } from "./program-card";

interface ProgramsListProps {
  filters: ProgramsQueryFilters;
}

export default function ProgramsList({ filters }: ProgramsListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isSuccess,
    isError,
  } = useInfinitePrograms(filters);

  const programs = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <InfiniteScroll
      initialLoad={false}
      loadMore={() => {
        if (!isFetching) fetchNextPage();
      }}
      hasMore={hasNextPage}
      useWindow
    >
      <ul className="space-y-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <ProgramCardSkeleton key={`initial-${index}`} />
          ))}
        {isSuccess && programs.length === 0 && (
          <li className="text-muted-foreground py-8 text-center">
            {filters.scope === "mine"
              ? "No programs of your own yet. Create one from scratch, or customize a copy of a curated program."
              : "No programs match these filters."}
          </li>
        )}
        {isSuccess &&
          programs.map((program) => (
            <li key={program.id}>
              <ProgramCard program={program} />
            </li>
          ))}
        {isFetchingNextPage && <ProgramCardSkeleton />}
        {isError && (
          <li className="text-destructive">
            An unexpected error occurred while loading programs. Please try
            again later.
          </li>
        )}
      </ul>
    </InfiniteScroll>
  );
}
