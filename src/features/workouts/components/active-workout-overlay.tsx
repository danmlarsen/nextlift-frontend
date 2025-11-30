"use client";

import { useState } from "react";
import { MaximizeIcon, XIcon } from "lucide-react";

import { useActiveWorkout, useWorkout } from "@/api/workouts/queries";
import { Button } from "@/components/ui/button";
import Timer from "@/components/ui/timer";
import DeleteActiveWorkoutDialog from "./workout-modal/delete-active-workout-dialog";
import { parseWorkoutTitle } from "@/lib/utils";
import { useDeleteWorkout } from "@/api/workouts/workout-mutations";
import { useWorkoutModal } from "./workout-modal/workout-modal-provider";
import { useQueryClient } from "@tanstack/react-query";

export default function ActiveWorkoutOverlay() {
  const [deleteWorkoutOpen, setDeleteWorkoutOpen] = useState(false);
  const { openWorkout } = useWorkoutModal();
  const { data: activeWorkout } = useActiveWorkout();
  const { data: workout } = useWorkout(activeWorkout?.id);
  const deleteWorkout = useDeleteWorkout();
  const queryClient = useQueryClient();

  const handleDeleteWorkoutConfirm = () => {
    if (!activeWorkout) return;
    deleteWorkout.mutate(activeWorkout.id, {
      onSuccess: () => {
        queryClient.setQueryData(["activeWorkout"], null);
      },
    });
  };

  if (!workout) return null;

  return (
    <>
      <div className="h-16 lg:hidden" />
      <div className="bg-sidebar text-sidebar-foreground fixed inset-x-0 bottom-16 z-10 grid h-16 translate-y-[1px] grid-cols-[auto_1fr_auto] items-center gap-2 rounded-t-lg px-2 lg:inset-x-auto lg:bottom-4 lg:h-auto lg:w-[250px] lg:grid-cols-2 lg:gap-4">
        <div className="flex items-center justify-start lg:row-start-2">
          <Button
            onClick={() => setDeleteWorkoutOpen(true)}
            variant="outline"
            className="p-4"
          >
            <XIcon />
          </Button>
        </div>
        <div className="flex flex-col items-center lg:col-span-2 lg:space-y-2">
          <div className="text-center text-sm font-bold">
            {parseWorkoutTitle(workout)}
          </div>
          <div className="bg-secondary text-secondary-foreground rounded-lg p-1 px-2 text-sm">
            <Timer workout={workout} />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            className="p-4"
            onClick={() => openWorkout(workout.id)}
          >
            <MaximizeIcon />
          </Button>
        </div>
      </div>

      <DeleteActiveWorkoutDialog
        isOpen={deleteWorkoutOpen}
        onOpenChanged={setDeleteWorkoutOpen}
        onConfirm={handleDeleteWorkoutConfirm}
      />
    </>
  );
}
