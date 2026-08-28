"use client";

import { addDays } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DATE_LOCALE } from "@/lib/constants";

type WeekNavigatorProps = {
  weekStart: Date;
  isCurrentWeek: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
};

function formatDay(date: Date) {
  return date.toLocaleDateString(DATE_LOCALE, {
    month: "short",
    day: "numeric",
  });
}

export default function WeekNavigator({
  weekStart,
  isCurrentWeek,
  onPreviousWeek,
  onNextWeek,
}: WeekNavigatorProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={onPreviousWeek} aria-label="Previous week">
        <ChevronLeftIcon />
      </Button>
      <div className="text-center">
        <p className="font-medium">
          {formatDay(weekStart)} - {formatDay(addDays(weekStart, 6))}
        </p>
        {isCurrentWeek && (
          <p className="text-muted-foreground text-xs">In progress</p>
        )}
      </div>
      <Button
        variant="ghost"
        onClick={onNextWeek}
        disabled={isCurrentWeek}
        aria-label="Next week"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
