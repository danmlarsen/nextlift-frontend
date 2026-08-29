"use client";

import { Button } from "@/components/ui/button";
import { useAddTemplateExercise } from "@/api/workout-templates/mutations";
import ExercisesView from "@/features/exercises/components/exercises-view/exercises-view";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Spinner } from "@/components/ui/spinner";
import { useHaptics } from "@/hooks/use-haptics";
import { useSearchParamState } from "@/hooks/use-search-param-state";

interface TemplateAddExerciseButtonProps {
  templateId: number;
}

export default function TemplateAddExerciseButton({
  templateId,
}: TemplateAddExerciseButtonProps) {
  // A distinct param key: the workout modal's exercise picker ("exercise-modal")
  // can coexist with this one on the same page.
  const [exerciseModalOpen, setExerciseModalOpen] = useSearchParamState(
    "template-exercise-modal",
  );
  const addTemplateExercise = useAddTemplateExercise();
  const { vibrate } = useHaptics();

  const handleAddExerciseClick = () => {
    vibrate();
    setExerciseModalOpen(true);
  };

  const handleExerciseClick = (exerciseId: number) => {
    if (addTemplateExercise.isPending) return;

    vibrate();
    addTemplateExercise.mutate(
      { templateId, exerciseId },
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
            {addTemplateExercise.isPending && (
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
