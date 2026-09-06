"use client";

import { toast } from "sonner";

import { useStartProgramWorkout } from "@/api/program-enrollments/mutations";
import { type Position } from "@/api/program-enrollments/types";
import { useActiveWorkout } from "@/api/workouts/queries";
import { useWorkoutModal } from "@/features/workouts/components/workout-modal/workout-modal-provider";
import { useHaptics } from "@/hooks/use-haptics";

/**
 * Starts a program day as a live workout and opens it. Mirrors the template
 * start button: an already active workout is opened instead of refused.
 */
export function useStartProgramDay() {
  const { data: activeWorkout } = useActiveWorkout();
  const startWorkout = useStartProgramWorkout();
  const { openWorkout } = useWorkoutModal();
  const { vibrate } = useHaptics();

  const start = (enrollmentId: number, position?: Position) => {
    vibrate();

    if (activeWorkout) {
      toast.info("You already have a workout in progress");
      openWorkout(activeWorkout.id);
      return;
    }

    startWorkout.mutate(
      { enrollmentId, data: position },
      {
        onSuccess: (newWorkout) => openWorkout(newWorkout.id),
        onError: (error) => {
          toast.error(
            error.message ||
              "Failed to start the program workout. Please try again later.",
          );
        },
      },
    );
  };

  return { start, isPending: startWorkout.isPending };
}
