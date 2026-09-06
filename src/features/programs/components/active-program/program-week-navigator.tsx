"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { type ProgramDurationMode } from "@/api/programs/types";
import { type WeekView } from "@/api/program-enrollments/types";
import { Button } from "@/components/ui/button";
import { formatWeekPosition } from "@/lib/program-format";

interface ProgramWeekNavigatorProps {
  week: WeekView;
  cycle: number;
  totalWeeks: number;
  durationMode: ProgramDurationMode;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export default function ProgramWeekNavigator({
  week,
  cycle,
  totalWeeks,
  durationMode,
  onPreviousWeek,
  onNextWeek,
}: ProgramWeekNavigatorProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={onPreviousWeek}
        disabled={week.weekIndex <= 1}
        aria-label="Previous week"
      >
        <ChevronLeftIcon />
      </Button>
      <div className="text-center">
        <p className="font-medium">
          {formatWeekPosition(cycle, week.weekIndex, totalWeeks, durationMode)}
        </p>
        <p className="text-muted-foreground text-xs">
          {week.blockName}
          {week.weekLabel
            ? ` · ${week.weekLabel}`
            : week.isDeload
              ? " · Deload"
              : ""}
        </p>
      </div>
      <Button
        variant="ghost"
        onClick={onNextWeek}
        disabled={week.weekIndex >= totalWeeks}
        aria-label="Next week"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
