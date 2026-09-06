"use client";

import Link from "next/link";
import { CalendarRangeIcon, ChevronRightIcon } from "lucide-react";

import { type EnrollmentData } from "@/api/program-enrollments/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  formatDayDate,
  formatWeekPosition,
  summarizeSets,
} from "@/lib/program-format";
import { useStartProgramDay } from "../hooks/use-start-program-day";
import { DayStatusBadge } from "./program-badges";

interface ActiveProgramCardProps {
  enrollment: EnrollmentData;
  /** Compact variant for the dashboard column. */
  compact?: boolean;
}

/** The next (or today's) program workout with a start button. */
export default function ActiveProgramCard({
  enrollment,
  compact = false,
}: ActiveProgramCardProps) {
  const { schedule, snapshot } = enrollment;
  const { start, isPending } = useStartProgramDay();
  const day = schedule.today ?? schedule.next;
  const dayStatus = schedule.today ? schedule.todayStatus : null;
  const canStart =
    enrollment.status === "ACTIVE" &&
    !!day &&
    dayStatus !== "COMPLETED" &&
    dayStatus !== "SKIPPED";
  const dateLabel = formatDayDate(
    schedule.today ? schedule.localDate : schedule.nextDate,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <CardDescription className="flex items-center gap-1">
              <CalendarRangeIcon className="size-3.5" />
              <span className="truncate">{enrollment.programName}</span>
            </CardDescription>
            <CardTitle className="truncate">
              {day
                ? `${schedule.today ? "Today" : "Next"}: ${day.dayName}`
                : enrollment.status === "COMPLETED"
                  ? "Program completed"
                  : "No upcoming workout"}
            </CardTitle>
            <CardDescription>
              {formatWeekPosition(
                day?.position.cycle ?? schedule.position.cycle,
                day?.position.weekIndex ?? schedule.position.weekIndex,
                schedule.totalWeeks,
                snapshot.durationMode,
              )}
              {dateLabel ? ` · ${dateLabel}` : ""}
              {day?.isDeload ? " · Deload" : ""}
            </CardDescription>
          </div>
          {dayStatus && <DayStatusBadge status={dayStatus} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {day && !compact && (
          <ul className="space-y-1 text-sm">
            {day.exercises.map((exercise) => (
              <li
                key={exercise.programExerciseId}
                className="flex justify-between gap-2"
              >
                <span className="truncate">{exercise.exercise.name}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {summarizeSets(exercise.sets, snapshot.effortScale)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {day && compact && (
          <p className="text-muted-foreground truncate text-sm">
            {day.exercises
              .map((exercise) => exercise.exercise.name)
              .join(" · ")}
          </p>
        )}
        {canStart ? (
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button
              onClick={() => start(enrollment.id, day.position)}
              disabled={isPending}
            >
              {isPending && <Spinner />}
              Start workout
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Open program"
            >
              <Link href="/app/programs/active">
                <ChevronRightIcon />
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link href="/app/programs/active">Open program</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
