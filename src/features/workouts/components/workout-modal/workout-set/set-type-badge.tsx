import { type WorkoutSetType } from "@/api/workouts/types";
import { cn } from "@/lib/utils";

interface SetTypeBadgeProps {
  type: WorkoutSetType;
  setNumber: number;
  className?: string;
}

export default function SetTypeBadge({
  type,
  setNumber,
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
      {type === "normal" && setNumber}
      {type === "warmup" && "W"}
      {type === "dropset" && "D"}
      {type === "failure" && "F"}
    </span>
  );
}
