"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useActiveWorkout } from "@/api/workouts/queries";
import { useCreateWorkoutFromTemplate } from "@/api/workouts/workout-mutations";
import { useWorkoutModal } from "@/features/workouts/components/workout-modal/workout-modal-provider";
import { useHaptics } from "@/hooks/use-haptics";

interface StartWorkoutFromTemplateButtonProps {
  templateId: number;
}

export default function StartWorkoutFromTemplateButton({
  templateId,
}: StartWorkoutFromTemplateButtonProps) {
  const { data: activeWorkout } = useActiveWorkout();
  const createWorkoutFromTemplate = useCreateWorkoutFromTemplate();
  const { openWorkout } = useWorkoutModal();
  const { vibrate } = useHaptics();

  const handleClick = () => {
    vibrate();

    if (activeWorkout) {
      toast.info("You already have a workout in progress");
      openWorkout(activeWorkout.id);
      return;
    }

    createWorkoutFromTemplate.mutate(templateId, {
      onSuccess: (newWorkout) => {
        openWorkout(newWorkout.id);
      },
      onError: () => {
        toast.error(
          "Failed to start a workout from this template. Please try again later.",
        );
      },
    });
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full"
      disabled={createWorkoutFromTemplate.isPending}
    >
      {createWorkoutFromTemplate.isPending && <Spinner />}
      Start Workout
    </Button>
  );
}
