import {
  type EffortScale,
  type ProgramDayData,
  type ProgramScheduleMode,
  type ProgramSetData,
} from "@/api/programs/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STRATEGY_LABELS,
  formatRest,
  formatWeekday,
  summarizeSets,
} from "@/lib/program-format";
import { Chip } from "../program-badges";

/** Rows for the first week: scoped rows when any exist, else the shared ones. */
export function firstWeekRows(sets: ProgramSetData[]): ProgramSetData[] {
  const scoped = sets.filter((set) => set.weekInBlock === 1);
  return scoped.length > 0
    ? scoped
    : sets.filter((set) => set.weekInBlock === null);
}

interface ProgramDayCardProps {
  day: ProgramDayData;
  effortScale: EffortScale;
  scheduleMode: ProgramScheduleMode;
}

export default function ProgramDayCard({
  day,
  effortScale,
  scheduleMode,
}: ProgramDayCardProps) {
  const weekday =
    scheduleMode === "CALENDAR" ? formatWeekday(day.weekday) : null;

  return (
    <Card className="gap-3 py-4 lg:py-5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="truncate">{day.name}</span>
          {weekday && <Chip className="text-muted-foreground">{weekday}</Chip>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-border/60 divide-y">
          {day.exercises.map((exercise) => {
            const rows = firstWeekRows(exercise.sets);
            const varies = exercise.sets.some(
              (set) => set.weekInBlock !== null,
            );
            const rest = formatRest(exercise.restSeconds);
            return (
              <li key={exercise.id} className="space-y-0.5 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">
                    {exercise.exercise.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {STRATEGY_LABELS[exercise.strategy]}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {summarizeSets(rows, effortScale) || "No sets"}
                  {varies ? " · varies by week" : ""}
                  {rest ? ` · rest ${rest}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
