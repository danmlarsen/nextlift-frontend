"use client";

import { Button } from "@/components/ui/button";
import ExerciseForm from "./exercise-form";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useSearchParamState } from "@/hooks/use-search-param-state";

export default function AddNewExerciseButton() {
  const [isOpen, setIsOpen] = useSearchParamState("add-exercise-modal");

  return (
    <>
      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        className="p-4"
        content={<ExerciseForm onSuccess={() => setIsOpen(false)} />}
        title="Add New Exercise"
        description="Add a custom Exercise"
      />
      <Button onClick={() => setIsOpen(true)}>Add New Exercise</Button>
    </>
  );
}
