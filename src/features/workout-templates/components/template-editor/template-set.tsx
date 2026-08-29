"use client";

import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useMutationState } from "@tanstack/react-query";

import {
  useDeleteTemplateSet,
  useUpdateTemplateSet,
} from "@/api/workout-templates/mutations";
import {
  type TemplateSetDto,
  type WorkoutTemplateSetData,
} from "@/api/workout-templates/types";
import { WORKOUT_SET_TYPES } from "@/api/workouts/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import SetTypeBadge from "@/features/workouts/components/workout-modal/workout-set/set-type-badge";
import WorkoutSetInput from "@/features/workouts/components/workout-modal/workout-set/workout-set-input";

interface TemplateSetProps {
  templateId: number;
  templateSet: WorkoutTemplateSetData;
  exerciseCategory: "strength" | "cardio";
}

const parseTemplateValue = (
  value: string,
  max: number,
  min: number,
  shouldTruncate = false,
): number | null => {
  if (value.trim() === "") return null;

  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed < min) return null;

  const clamped = Math.min(max, parsed);

  if (shouldTruncate) {
    return Math.trunc(clamped);
  }

  return value.includes(".") ? parseFloat(clamped.toFixed(2)) : clamped;
};

const parseReps = (value: string) => parseTemplateValue(value, 999, 1, true);
const parseWeight = (value: string) => parseTemplateValue(value, 9999, 0);
const parseDuration = (value: string) =>
  parseTemplateValue(value, 9999, 1, true);

export default function TemplateSet({
  templateId,
  templateSet,
  exerciseCategory,
}: TemplateSetProps) {
  const [weight, setWeight] = useState(templateSet.weight?.toString() || "");
  const [reps, setReps] = useState(templateSet.reps?.toString() || "");
  const [duration, setDuration] = useState(
    templateSet.duration?.toString() || "",
  );
  const isPendingDelete = useMutationState({
    filters: {
      mutationKey: ["deleteTemplateSet"],
      status: "pending",
    },
    select: (mutation) => mutation.state.variables as { setId: number },
  }).some((set) => set.setId === templateSet.id);

  const { mutate } = useUpdateTemplateSet();
  const deleteTemplateSet = useDeleteTemplateSet();

  const updateTemplateSet = (payload: TemplateSetDto) => {
    mutate({
      templateId,
      templateExerciseId: templateSet.workoutTemplateExerciseId,
      setId: templateSet.id,
      data: payload,
    });
  };

  const debouncedUpdateWeight = useDebouncedCallback(
    (weight: number | null) => {
      updateTemplateSet({ weight });
    },
    500,
  );

  const debouncedUpdateReps = useDebouncedCallback((reps: number | null) => {
    updateTemplateSet({ reps });
  }, 500);

  const debouncedUpdateDuration = useDebouncedCallback(
    (duration: number | null) => {
      updateTemplateSet({ duration });
    },
    500,
  );

  const handleWeightChange = (value: string) => {
    // Only allow empty string or valid numbers up to 4 digits
    if (
      value === "" ||
      (/^\d{1,4}(\.\d{0,2})?$/.test(value) && parseFloat(value) <= 9999)
    ) {
      setWeight(value);
      const numericValue = parseWeight(value);
      debouncedUpdateWeight(numericValue);
    }
    // Invalid input is simply ignored
  };

  const handleWeightBlur = () => {
    debouncedUpdateWeight.cancel();
    const numericValue = parseWeight(weight);
    if (numericValue !== templateSet.weight) {
      updateTemplateSet({ weight: numericValue });
    }
  };

  const handleRepsChange = (value: string) => {
    // Only allow empty string or valid numbers up to 3 digits
    if (value === "" || (/^\d{1,3}$/.test(value) && parseInt(value) <= 999)) {
      setReps(value);
      const numericValue = parseReps(value);
      debouncedUpdateReps(numericValue);
    }
  };

  const handleRepsBlur = () => {
    debouncedUpdateReps.cancel();
    const numericValue = parseReps(reps);
    if (numericValue !== templateSet.reps) {
      updateTemplateSet({ reps: numericValue });
    }
  };

  const handleDurationChange = (value: string) => {
    // Only allow empty string or valid numbers up to 4 digits
    if (value === "" || (/^\d{1,4}$/.test(value) && parseInt(value) <= 9999)) {
      setDuration(value);
      const numericValue = parseDuration(value);
      debouncedUpdateDuration(numericValue);
    }
  };

  const handleDurationBlur = () => {
    debouncedUpdateDuration.cancel();
    const numericValue = parseDuration(duration);
    if (numericValue !== templateSet.duration) {
      updateTemplateSet({ duration: numericValue });
    }
  };

  return (
    <TableRow className={cn("", isPendingDelete && "animate-pulse")}>
      <TableCell className="py-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="size-8 px-0 py-0 text-xs">
              <SetTypeBadge
                type={templateSet.type}
                setNumber={templateSet.setNumber}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {WORKOUT_SET_TYPES.map((type) => (
              <DropdownMenuItem asChild key={type}>
                <Button
                  onClick={() => updateTemplateSet({ type })}
                  variant="ghost"
                  className="flex w-full justify-start gap-2 px-1 capitalize"
                >
                  <SetTypeBadge
                    type={type}
                    setNumber={templateSet.setNumber}
                    className="bg-secondary-foreground flex size-8 items-center justify-center rounded-sm"
                  />
                  <div>{type}</div>
                </Button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild>
              <Button
                onClick={() =>
                  deleteTemplateSet.mutate({
                    templateId,
                    templateExerciseId: templateSet.workoutTemplateExerciseId,
                    setId: templateSet.id,
                  })
                }
                variant="ghost"
                className="flex w-full justify-start gap-2 px-1 capitalize"
              >
                <div className="bg-secondary-foreground text-destructive flex size-8 items-center justify-center rounded-sm">
                  X
                </div>
                <div>Remove Set</div>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      {exerciseCategory === "strength" && (
        <>
          <TableCell className="py-1">
            <WorkoutSetInput
              placeholder="kg"
              value={weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              onBlur={handleWeightBlur}
              disabled={isPendingDelete}
            />
          </TableCell>
          <TableCell className="py-1">
            <WorkoutSetInput
              placeholder="Reps"
              value={reps}
              onChange={(e) => handleRepsChange(e.target.value)}
              onBlur={handleRepsBlur}
              disabled={isPendingDelete}
            />
          </TableCell>
        </>
      )}
      {exerciseCategory === "cardio" && (
        <TableCell className="py-1">
          <WorkoutSetInput
            placeholder="Minutes"
            value={duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            onBlur={handleDurationBlur}
            disabled={isPendingDelete}
          />
        </TableCell>
      )}
    </TableRow>
  );
}
