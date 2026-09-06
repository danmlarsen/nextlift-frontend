import { type WorkoutSetType } from "@/api/workouts/types";
import { cn } from "@/lib/utils";

interface SetTypeBadgeProps {
  type: WorkoutSetType;
  setNumber: number;
  /** Program AMRAP set: as many reps as possible, shown as "5+". */
  amrap?: boolean;
  className?: string;
}

export default function SetTypeBadge({
  type,
  setNumber,
  amrap = false,
  className,
}: SetTypeBadgeProps) {
  return (
    <span
      className={cn(
        type === "warmup" && "text-amber-500",
        type === "dropset" && "text-blue-500",
        type === "failure" && "text-red-500",
        className,
      )}
    >
      {type === "normal" && (amrap ? `${setNumber}+` : setNumber)}
      {type === "warmup" && "W"}
      {type === "dropset" && "D"}
      {type === "failure" && "F"}
    </span>
  );
}
