"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { type WorkoutData } from "@/api/workouts/types";
import { useCreateTemplateFromWorkout } from "@/api/workout-templates/mutations";
import { parseWorkoutTitle } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";
import TemplateNameDialog from "./template-name-dialog";

interface SaveWorkoutAsTemplateButtonProps {
  workout: WorkoutData;
}

export default function SaveWorkoutAsTemplateButton({
  workout,
}: SaveWorkoutAsTemplateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const createTemplateFromWorkout = useCreateTemplateFromWorkout();
  const { vibrate } = useHaptics();

  const handleSave = (name: string) => {
    createTemplateFromWorkout.mutate(
      { workoutId: workout.id, name },
      {
        onSuccess: () => {
          setDialogOpen(false);
          toast.success("Template saved");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to save template");
        },
      },
    );
  };

  return (
    <>
      <TemplateNameDialog
        key={String(dialogOpen)}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Save as Template"
        description="Save this workout's exercises and sets as a reusable template."
        defaultName={parseWorkoutTitle(workout)}
        submitLabel="Save"
        isPending={createTemplateFromWorkout.isPending}
        onSubmit={handleSave}
      />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          vibrate();
          setDialogOpen(true);
        }}
      >
        Save as Template
      </Button>
    </>
  );
}
