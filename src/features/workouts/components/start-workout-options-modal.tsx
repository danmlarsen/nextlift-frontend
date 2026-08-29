"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useCreateActiveWorkout,
  useCreateWorkoutFromTemplate,
} from "@/api/workouts/workout-mutations";
import { useWorkoutTemplates } from "@/api/workout-templates/queries";
import { useWorkoutModal } from "./workout-modal/workout-modal-provider";
import { useHaptics } from "@/hooks/use-haptics";

interface StartWorkoutOptionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StartWorkoutOptionsModal({
  isOpen,
  onOpenChange,
}: StartWorkoutOptionsModalProps) {
  const createActiveWorkout = useCreateActiveWorkout();
  const createWorkoutFromTemplate = useCreateWorkoutFromTemplate();
  const templates = useWorkoutTemplates();
  const { openWorkout } = useWorkoutModal();
  const { vibrate } = useHaptics();

  const isPending =
    createActiveWorkout.isPending || createWorkoutFromTemplate.isPending;

  const handleStarted = (workoutId: number) => {
    onOpenChange(false);
    openWorkout(workoutId);
  };

  const handleStartEmpty = () => {
    vibrate();
    createActiveWorkout.mutate(undefined, {
      onSuccess: (newWorkout) => handleStarted(newWorkout.id),
      onError: () => {
        toast.error(
          "Failed to create a new workout. This is probably due to a network issue. Please try again later.",
        );
      },
    });
  };

  const handleStartFromTemplate = (templateId: number) => {
    vibrate();
    createWorkoutFromTemplate.mutate(templateId, {
      onSuccess: (newWorkout) => handleStarted(newWorkout.id),
      onError: () => {
        toast.error(
          "Failed to start a workout from this template. Please try again later.",
        );
      },
    });
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Start Workout"
      description="Start an empty workout or pick one of your templates"
      content={
        <div className="space-y-4 p-4">
          <h2 className="text-xl font-bold">Start Workout</h2>

          <Button
            className="w-full"
            onClick={handleStartEmpty}
            disabled={isPending}
          >
            {createActiveWorkout.isPending && <Spinner />}
            Start empty Workout
          </Button>

          <p className="text-muted-foreground text-sm font-medium">
            Or start from a template
          </p>

          <ul className="space-y-2">
            {templates.isLoading &&
              Array.from({ length: 2 }).map((_, index) => (
                <li key={`initial-${index}`}>
                  <Skeleton className="h-12 rounded-md" />
                </li>
              ))}
            {templates.isSuccess && templates.data.length === 0 && (
              <li className="text-muted-foreground text-sm">
                No templates yet. Save a completed workout as a template or
                create one on the Templates page.
              </li>
            )}
            {templates.isSuccess &&
              templates.data.map((template) => {
                const totalSets = template.workoutTemplateExercises.reduce(
                  (sum, templateExercise) =>
                    sum + templateExercise.workoutTemplateSets.length,
                  0,
                );
                const isStartingThis =
                  createWorkoutFromTemplate.isPending &&
                  createWorkoutFromTemplate.variables === template.id;

                return (
                  <li key={template.id} className="grid">
                    <Button
                      variant="outline"
                      className="h-auto w-full justify-between py-3"
                      disabled={isPending}
                      onClick={() => handleStartFromTemplate(template.id)}
                    >
                      <span className="truncate font-semibold">
                        {isStartingThis && <Spinner className="mr-2 inline" />}
                        {template.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {template.workoutTemplateExercises.length}{" "}
                        {template.workoutTemplateExercises.length === 1
                          ? "exercise"
                          : "exercises"}{" "}
                        · {totalSets} {totalSets === 1 ? "set" : "sets"}
                      </span>
                    </Button>
                  </li>
                );
              })}
            {templates.isError && (
              <li className="text-destructive text-sm">
                An unexpected error occurred while loading workout templates.
                Please try again later.
              </li>
            )}
          </ul>
        </div>
      }
    />
  );
}
