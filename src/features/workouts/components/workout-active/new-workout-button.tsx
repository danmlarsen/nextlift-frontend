"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useActiveWorkout } from "@/api/workouts/queries";
import { useCreateActiveWorkout } from "@/api/workouts/workout-mutations";
import { Spinner } from "@/components/ui/spinner";
import { useWorkoutModal } from "../workout-modal/workout-modal-provider";

export default function NewWorkoutButton() {
  const { data: activeWorkout } = useActiveWorkout();
  const createActiveWorkout = useCreateActiveWorkout();
  const { openWorkout } = useWorkoutModal();

  const handleClick = () => {
    if (activeWorkout) {
      openWorkout(activeWorkout.id);
    } else {
      createActiveWorkout.mutate(undefined, {
        onSuccess: (newWorkout) => {
          openWorkout(newWorkout.id);
        },
        onError: () => {
          toast.error(
            "Failed to create a new workout. This is probably due to a network issue. Please try again later.",
          );
        },
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full"
      disabled={createActiveWorkout.isPending}
    >
      {createActiveWorkout.isPending && <Spinner />}
      {activeWorkout ? "Go to active workout" : "Start new Workout"}
    </Button>
  );
}
