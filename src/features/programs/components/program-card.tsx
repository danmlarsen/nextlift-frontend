"use client";

import Link from "next/link";

import { type ProgramSummaryData } from "@/api/programs/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/program-format";
import { GoalBadge, LevelBadge } from "./program-badges";
import ProgramCardMenu from "./program-card-menu";

interface ProgramCardProps {
  program: ProgramSummaryData;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card className="text-left">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Button
            asChild
            variant="link"
            className="h-auto justify-start px-0 text-left font-bold whitespace-normal lg:text-xl"
          >
            <Link href={`/app/programs/${program.id}`}>{program.name}</Link>
          </Button>
          <ProgramCardMenu program={program} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <LevelBadge level={program.level} />
          <GoalBadge goal={program.goal} />
        </div>
        <CardDescription>
          {program.daysPerWeek} {program.daysPerWeek === 1 ? "day" : "days"}
          /week · {formatDuration(
            program.totalWeeks,
            program.durationMode,
          )} ·{" "}
          {program.scheduleMode === "CALENDAR" ? "Fixed weekdays" : "Rotation"}
        </CardDescription>
      </CardHeader>
      {(program.description || program.credit) && (
        <CardContent className="space-y-2">
          {program.description && (
            <p className="line-clamp-3 text-sm">{program.description}</p>
          )}
          {program.credit && (
            <p className="text-muted-foreground text-xs">{program.credit}</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function ProgramCardSkeleton() {
  return (
    <li>
      <Skeleton className="h-[180px] rounded-xl" />
    </li>
  );
}
