"use client";

import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";

import {
  useSetProgramPosition,
  useSkipProgramDay,
} from "@/api/program-enrollments/mutations";
import {
  type DayView,
  type EnrollmentData,
  type WeekView,
} from "@/api/program-enrollments/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkoutModal } from "@/features/workouts/components/workout-modal/workout-modal-provider";
import { formatDayDate, formatWeekday } from "@/lib/program-format";
import { cn } from "@/lib/utils";
import { useStartProgramDay } from "../../hooks/use-start-program-day";
import { DayStatusBadge } from "../program-badges";

interface DayListProps {
  enrollment: EnrollmentData;
  week: WeekView;
}

export default function DayList({ enrollment, week }: DayListProps) {
  const { schedule } = enrollment;
  const { start } = useStartProgramDay();
  const skipDay = useSkipProgramDay();
  const setPosition = useSetProgramPosition();
  const { openWorkout } = useWorkoutModal();
  const isActive = enrollment.status === "ACTIVE";

  const positionOf = (day: DayView) => ({
    cycle: schedule.position.cycle,
    weekIndex: week.weekIndex,
    dayIndex: day.dayIndex,
  });

  const isCurrent = (day: DayView) =>
    schedule.position.weekIndex === week.weekIndex &&
    schedule.position.dayIndex === day.dayIndex;

  const handleSkip = (day: DayView) => {
    skipDay.mutate(
      { enrollmentId: enrollment.id, data: positionOf(day) },
      {
        onSuccess: () => toast.success(`${day.dayName} skipped`),
        onError: (error) =>
          toast.error(error.message || "Could not skip the day"),
      },
    );
  };

  const handleSetNext = (day: DayView) => {
    setPosition.mutate(
      { enrollmentId: enrollment.id, data: positionOf(day) },
      {
        onSuccess: () => toast.success(`${day.dayName} is up next`),
        onError: (error) =>
          toast.error(error.message || "Could not move the schedule"),
      },
    );
  };

  return (
    <ul className="divide-border/60 divide-y rounded-xl border">
      {week.days.map((day) => {
        const startable =
          isActive && day.status !== "COMPLETED" && day.status !== "STARTED";
        const subtitle = [
          schedule.mode === "CALENDAR"
            ? formatDayDate(day.date)
            : formatWeekday(day.weekday),
          day.exerciseNames.join(" · "),
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li
            key={day.dayId}
            className={cn(
              "flex items-center gap-3 px-3 py-3",
              isCurrent(day) && schedule.mode === "SEQUENCE" && "bg-accent/10",
            )}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{day.dayName}</span>
                <DayStatusBadge status={day.status} />
              </div>
              <p className="text-muted-foreground truncate text-xs">
                {subtitle}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`${day.dayName} actions`}
                >
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {startable && (
                  <DropdownMenuItem
                    onSelect={() => start(enrollment.id, positionOf(day))}
                  >
                    Start workout
                  </DropdownMenuItem>
                )}
                {day.status === "STARTED" && day.workoutId && (
                  <DropdownMenuItem
                    onSelect={() => openWorkout(day.workoutId!)}
                  >
                    Resume workout
                  </DropdownMenuItem>
                )}
                {day.status === "COMPLETED" && day.workoutId && (
                  <DropdownMenuItem
                    onSelect={() => openWorkout(day.workoutId!, false)}
                  >
                    View workout
                  </DropdownMenuItem>
                )}
                {startable && day.status !== "SKIPPED" && (
                  <DropdownMenuItem onSelect={() => handleSkip(day)}>
                    Skip day
                  </DropdownMenuItem>
                )}
                {isActive &&
                  schedule.mode === "SEQUENCE" &&
                  !isCurrent(day) && (
                    <DropdownMenuItem onSelect={() => handleSetNext(day)}>
                      Make this the next day
                    </DropdownMenuItem>
                  )}
                {isActive && schedule.mode === "CALENDAR" && (
                  <DropdownMenuItem onSelect={() => handleSetNext(day)}>
                    Move the schedule here
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        );
      })}
    </ul>
  );
}
