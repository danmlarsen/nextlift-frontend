"use client";

import { Button } from "@/components/ui/button";
import { useAddWorkoutExercise } from "@/api/workouts/workout-exercise-mutations";
import ExercisesView from "@/features/exercises/components/exercises-view/exercises-view";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Spinner } from "@/components/ui/spinner";
import { useHaptics } from "@/hooks/use-haptics";
import { useSearchParamState } from "@/hooks/use-search-param-state";

interface AddExerciseButtonProps {
  workoutId: number;
}

export default function AddExerciseButton({
  workoutId,
}: AddExerciseButtonProps) {
  const [exerciseModalOpen, setExerciseModalOpen] =
    useSearchParamState("exercise-modal");
  const addWorkoutExercise = useAddWorkoutExercise();
  const { vibrate } = useHaptics();

  const handleAddExerciseClick = () => {
    vibrate();
    setExerciseModalOpen(true);
  };

  const handleExerciseClick = (exerciseId: number) => {
    if (addWorkoutExercise.isPending) return;

    vibrate();
    addWorkoutExercise.mutate(
      { workoutId, exerciseId },
      {
        onSuccess: () => {
          setExerciseModalOpen(false);
        },
      },
    );
  };

  return (
    <>
      <ResponsiveModal
        isOpen={exerciseModalOpen}
        onOpenChange={setExerciseModalOpen}
        title="Add Exercise"
        content={
          <div className="relative grid h-full overflow-y-auto p-4">
            <ExercisesView onExerciseClick={handleExerciseClick} />
            {addWorkoutExercise.isPending && (
              <div className="fixed inset-0 z-50 bg-black/50">
                <Spinner className="absolute top-1/2 left-1/2 z-50 size-6 -translate-x-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>
        }
      />
      <Button className="w-full" onClick={handleAddExerciseClick}>
        + Add Exercise
      </Button>
    </>
  );
}
