"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  useCompleteWorkout,
  useCreateDraftWorkout,
  useDeleteWorkout,
} from "@/api/workouts/workout-mutations";
import { useWorkout } from "@/api/workouts/queries";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import WorkoutForm from "../workout-form/workout-form";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import { useWorkoutModal } from "./workout-modal-provider";

interface AddWorkoutButtonProps extends React.ComponentProps<"button"> {
  selectedDate?: Date;
}

export default function AddWorkoutButton({
  selectedDate,
  className,
  children,
  ...props
}: AddWorkoutButtonProps) {
  const createWorkout = useCreateDraftWorkout();
  const completeWorkout = useCompleteWorkout();
  const deleteWorkout = useDeleteWorkout();
  const { openWorkout } = useWorkoutModal();

  const handleAddWorkout = () => {
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

  // const handleOpenChange = () => {
  //   setOpen(false);
  //   if (workout.data && workout.data.status === "DRAFT") {
  //     deleteWorkout.mutate(workout.data.id);
  //   }
  // };

  // const handleSaveWorkout = () => {
  //   if (!workout.data) return;
  //   completeWorkout.mutate(workout.data.id, {
  //     onSuccess: () => {
  //       setOpen(false);
  //     },
  //   });
  // };

  // const handleDiscardWorkout = () => {
  //   if (!workout.data) return;
  //   deleteWorkout.mutate(workout.data.id, {
  //     onSuccess: () => {
  //       setOpen(false);
  //     },
  //   });
  // };

  return (
    <>
      {/* {createWorkout.isSuccess && (
        <ResponsiveModal
          isOpen={open}
          onOpenChange={handleOpenChange}
          content={
            <div className="px-4">
              {workout.data && (
                <WorkoutForm
                  workout={workout.data}
                  onClose={handleDiscardWorkout}
                  onSuccess={handleSaveWorkout}
                />
              )}
            </div>
          }
          title="Add workout"
          description="Add workout"
        />
      )} */}
      <Button
        className={cn("", className)}
        onClick={handleAddWorkout}
        disabled={createWorkout.isPending}
        {...props}
      >
        {createWorkout.isPending && <Spinner />}
        {children ? children : "Add Workout"}
      </Button>
    </>
  );
}
