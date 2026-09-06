import Link from "next/link";
import {
  ActivityIcon,
  ArrowRightIcon,
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import {
  type ProgressionEventKind,
  type ProgressionSummaryData,
} from "@/api/program-enrollments/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ICONS: Record<ProgressionEventKind, typeof TrendingUpIcon> = {
  SEED: TrendingUpIcon,
  INCREMENT: TrendingUpIcon,
  TM_INCREMENT: TrendingUpIcon,
  REPS_INCREMENT: TrendingUpIcon,
  DECREMENT: TrendingDownIcon,
  RESET: TrendingDownIcon,
  HOLD: MinusIcon,
  FAIL: MinusIcon,
  STAGE_ADVANCE: ArrowRightIcon,
  E1RM_UPDATE: ActivityIcon,
};

const UP_KINDS: ProgressionEventKind[] = [
  "SEED",
  "INCREMENT",
  "TM_INCREMENT",
  "REPS_INCREMENT",
  "E1RM_UPDATE",
];
const DOWN_KINDS: ProgressionEventKind[] = ["DECREMENT", "RESET"];

interface ProgramProgressionSummaryProps {
  progression: ProgressionSummaryData;
}

/** What the program decided after a completed workout, shown in the summary. */
export default function ProgramProgressionSummary({
  progression,
}: ProgramProgressionSummaryProps) {
  return (
    <Card className="text-left">
      <CardHeader>
        <CardTitle>Program updated</CardTitle>
        <CardDescription>
          {progression.programCompleted
            ? "That was the last day of the program. Well done!"
            : progression.nextDayName
              ? `Next up: ${progression.nextDayName}`
              : "Your schedule has been updated."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {progression.events.length > 0 && (
          <ul className="space-y-2 text-sm">
            {progression.events.map((event) => {
              const Icon = ICONS[event.kind];
              const tone = UP_KINDS.includes(event.kind)
                ? "text-emerald-600 dark:text-emerald-400"
                : DOWN_KINDS.includes(event.kind)
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground";
              return (
                <li
                  key={`${event.progressionKey}-${event.kind}`}
                  className="flex gap-2"
                >
                  <Icon
                    className={`mt-0.5 size-4 shrink-0 ${tone}`}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-medium">{event.exerciseName}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {event.message}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href="/app/programs/active">Open program</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
