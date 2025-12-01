"use client";

import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useMutationState } from "@tanstack/react-query";

import { useUpdateWorkoutSet } from "@/api/workouts/workout-set-mutations";
import { type WorkoutSetDto, type WorkoutSetData } from "@/api/workouts/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import WorkoutSetOptionsButton from "./workout-set-options-button";
import { useWorkoutModal } from "../workout-modal-provider";
import { useHaptics } from "@/hooks/use-haptics";

interface WorkoutSetProps {
  workoutSet: WorkoutSetData;
  exerciseCategory: "strength" | "cardio";
  previousSet?: WorkoutSetData;
  placeholderSet?: Partial<WorkoutSetData>;
}

const parseWorkoutValue = (
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

const parseReps = (value: string) => parseWorkoutValue(value, 999, 1, true);
const parseWeight = (value: string) => parseWorkoutValue(value, 9999, 0);
const parseDuration = (value: string) =>
  parseWorkoutValue(value, 9999, 1, true);

export default function WorkoutSet({
  workoutSet,
  exerciseCategory,
  previousSet,
  placeholderSet,
}: WorkoutSetProps) {
  const [isChecked, setIsChecked] = useState(workoutSet.completed);
  const [weight, setWeight] = useState(workoutSet.weight?.toString() || "");
  const [reps, setReps] = useState(workoutSet.reps?.toString() || "");
  const [duration, setDuration] = useState(
    workoutSet?.duration?.toString() || "",
  );
  const { vibrate } = useHaptics();
  const { workout, isEditing } = useWorkoutModal();
  const isPendingDelete = useMutationState({
    filters: {
      mutationKey: ["deleteWorkoutSet"],
      status: "pending",
    },
    select: (mutation) => mutation.state.variables as { setId: number },
  }).some((set) => set.setId === workoutSet.id);

  const workoutId = workout?.id;
  const { mutate } = useUpdateWorkoutSet();
  const updateWorkoutSet = (payload: WorkoutSetDto) => {
    if (!workoutId) return;
    mutate({
      workoutId,
      workoutExerciseId: workoutSet.workoutExerciseId,
      setId: workoutSet.id,
      data: payload,
    });
  };

  const debouncedUpdateWeight = useDebouncedCallback(
    (weight: number | null) => {
      updateWorkoutSet({ weight });
    },
    500,
  );

  const debouncedUpdateReps = useDebouncedCallback((reps: number | null) => {
    updateWorkoutSet({ reps });
  }, 500);

  const debouncedUpdateDuration = useDebouncedCallback(
    (duration: number | null) => {
      updateWorkoutSet({ duration });
    },
    500,
  );

  const handleCheckedChange = (checkedChange: boolean) => {
    vibrate();
    setIsChecked(checkedChange);

    debouncedUpdateWeight.cancel();
    debouncedUpdateReps.cancel();
    debouncedUpdateDuration.cancel();

    const numericWeight = parseWeight(weight);
    const numericReps = parseReps(reps);
    const numericDuration = parseDuration(duration);

    const shouldUsePlaceholder = checkedChange && !workoutSet.completed;

    const payload = {
      weight:
        numericWeight ??
        (shouldUsePlaceholder ? placeholderSet?.weight : workoutSet.weight) ??
        null,
      reps:
        numericReps ||
        (shouldUsePlaceholder ? placeholderSet?.reps : workoutSet.reps) ||
        null,
      duration:
        numericDuration ||
        (shouldUsePlaceholder
          ? placeholderSet?.duration
          : workoutSet.duration) ||
        null,
      completed: checkedChange,
    };

    if (
      checkedChange &&
      exerciseCategory === "strength" &&
      (payload.weight === null || !payload.reps)
    ) {
      setIsChecked(workoutSet.completed);
      return;
    }

    if (checkedChange && exerciseCategory === "cardio" && !payload.duration) {
      setIsChecked(workoutSet.completed);
      return;
    }

    updateWorkoutSet(payload);
  };

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
    if (numericValue !== workoutSet.weight) {
      updateWorkoutSet({ weight: numericValue });
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
    if (numericValue !== workoutSet.reps) {
      updateWorkoutSet({ reps: numericValue });
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
    if (numericValue !== workoutSet.duration) {
      updateWorkoutSet({ duration: numericValue });
    }
  };

  let previousSetString = "-";
  if (exerciseCategory === "strength" && previousSet) {
    previousSetString = `${previousSet.weight} x ${previousSet.reps}`;
  }
  if (exerciseCategory === "cardio" && previousSet) {
    previousSetString = `${previousSet.duration} Minutes`;
  }

  return (
    <TableRow
      className={cn(
        isChecked && "bg-secondary/5 hover:bg-secondary/10",
        isPendingDelete && "animate-pulse",
      )}
    >
      <TableCell>
        <WorkoutSetOptionsButton workoutSet={workoutSet} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {previousSetString}
      </TableCell>
      <TableCell>
        {exerciseCategory === "strength" && (
          <Input
            type="number"
            placeholder={
              placeholderSet?.weight ? placeholderSet.weight.toString() : ""
            }
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            onBlur={handleWeightBlur}
            disabled={isChecked || isPendingDelete}
            className="h-9 text-center"
          />
        )}
      </TableCell>
      <TableCell>
        {exerciseCategory === "strength" && (
          <Input
            type="number"
            placeholder={
              placeholderSet?.reps ? placeholderSet.reps.toString() : ""
            }
            value={reps}
            onChange={(e) => handleRepsChange(e.target.value)}
            onBlur={handleRepsBlur}
            disabled={isChecked || isPendingDelete}
            className="h-9 text-center"
          />
        )}
        {exerciseCategory === "cardio" && (
          <Input
            type="number"
            placeholder={
              placeholderSet?.duration ? placeholderSet.duration.toString() : ""
            }
            value={duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            onBlur={handleDurationBlur}
            disabled={isChecked || isPendingDelete}
            className="h-9 text-center"
          />
        )}
      </TableCell>
      <TableCell>
        <Checkbox
          className="size-8 rounded-full"
          checked={isChecked}
          onCheckedChange={(checked) => handleCheckedChange(!!checked)}
          disabled={!isEditing || isPendingDelete}
        />
      </TableCell>
    </TableRow>
  );
}
