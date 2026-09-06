"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { useActiveEnrollment } from "@/api/program-enrollments/queries";
import { type ProgramsQueryFilters } from "@/api/programs/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActiveProgramCard from "./active-program-card";
import ProgramFilters from "./program-filters";
import ProgramsList from "./programs-list";

export default function ProgramsView() {
  const [filters, setFilters] = useState<ProgramsQueryFilters>({
    scope: "system",
  });
  const activeEnrollment = useActiveEnrollment();

  return (
    <div className="mx-auto w-full max-w-xl space-y-4">
      <div className="flex min-h-12 items-center justify-between">
        <h1 className="text-xl font-bold">Programs</h1>
      </div>

      {activeEnrollment.isLoading && (
        <Skeleton className="h-[160px] rounded-xl" />
      )}
      {activeEnrollment.data && (
        <ActiveProgramCard enrollment={activeEnrollment.data} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {filters.scope === "system" ? "Library" : "My programs"}
        </h2>
        <Tabs
          value={filters.scope}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              scope: value as ProgramsQueryFilters["scope"],
            })
          }
        >
          <TabsList>
            <TabsTrigger value="system">Library</TabsTrigger>
            <TabsTrigger value="mine">Mine</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filters.scope === "system" && (
        <ProgramFilters filters={filters} onChange={setFilters} />
      )}
      {filters.scope === "mine" && (
        <Button asChild className="w-full">
          <Link href="/app/programs/new">
            <PlusIcon /> New program
          </Link>
        </Button>
      )}

      <ProgramsList filters={filters} />
    </div>
  );
}
