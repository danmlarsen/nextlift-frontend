"use client";

import { toast } from "sonner";

import { useCreateDraftWorkout } from "@/api/workouts/workout-mutations";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useWorkoutModal } from "./workout-modal/workout-modal-provider";
import { useHaptics } from "@/hooks/use-haptics";

interface NewDraftWorkoutButtonProps extends React.ComponentProps<"button"> {
  selectedDate?: Date;
}

export default function NewDraftWorkoutButton({
  selectedDate,
  className,
  children,
  ...props
}: NewDraftWorkoutButtonProps) {
  const createWorkout = useCreateDraftWorkout();
  const { openWorkout } = useWorkoutModal();
  const { vibrate } = useHaptics();

  const handleAddWorkout = () => {
    vibrate();
    createWorkout.mutate(
      { startedAt: selectedDate?.toISOString() || undefined },
      {
        onSuccess: (workout) => {
          openWorkout(workout.id);
        },
        onError: () => {
          toast.error(
            "Failed to create a new workout. This is probably due to a network issue. Please try again later.",
          );
        },
      },
    );
  };

  return (
    <Button
      className={cn("", className)}
      onClick={handleAddWorkout}
      disabled={createWorkout.isPending}
      {...props}
    >
      {createWorkout.isPending && <Spinner />}
      {children ? children : "Add Workout"}
    </Button>
  );
}
