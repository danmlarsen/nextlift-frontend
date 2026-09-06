import { type ProgramGoal, type ProgramLevel } from "@/api/programs/types";
import { type DayStatus } from "@/api/program-enrollments/types";
import { cn } from "@/lib/utils";
import {
  DAY_STATUS_LABELS,
  PROGRAM_GOAL_LABELS,
  PROGRAM_LEVEL_LABELS,
} from "@/lib/program-format";

export function Chip({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

const LEVEL_CLASSES: Record<ProgramLevel, string> = {
  BEGINNER: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  NOVICE: "border-teal-500/40 text-teal-600 dark:text-teal-400",
  INTERMEDIATE: "border-blue-500/40 text-blue-600 dark:text-blue-400",
  ADVANCED: "border-violet-500/40 text-violet-600 dark:text-violet-400",
  ELITE: "border-rose-500/40 text-rose-600 dark:text-rose-400",
};

export function LevelBadge({ level }: { level: ProgramLevel }) {
  return (
    <Chip
      className={LEVEL_CLASSES[level]}
      aria-label={`Level: ${PROGRAM_LEVEL_LABELS[level]}`}
    >
      {PROGRAM_LEVEL_LABELS[level]}
    </Chip>
  );
}

export function GoalBadge({ goal }: { goal: ProgramGoal }) {
  return (
    <Chip
      className="text-muted-foreground"
      aria-label={`Goal: ${PROGRAM_GOAL_LABELS[goal]}`}
    >
      {PROGRAM_GOAL_LABELS[goal]}
    </Chip>
  );
}

const STATUS_CLASSES: Record<DayStatus, string> = {
  PENDING: "text-muted-foreground",
  STARTED: "border-accent/60 text-accent",
  COMPLETED: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  SKIPPED: "text-muted-foreground line-through",
  MISSED: "border-amber-500/40 text-amber-600 dark:text-amber-400",
};

export function DayStatusBadge({ status }: { status: DayStatus }) {
  return (
    <Chip className={STATUS_CLASSES[status]}>{DAY_STATUS_LABELS[status]}</Chip>
  );
}
