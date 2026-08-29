"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type WorkoutTemplateData } from "@/api/workout-templates/types";
import { useUpdateWorkoutTemplate } from "@/api/workout-templates/mutations";
import WorkoutNotes from "@/features/workouts/components/workout-modal/workout-notes/workout-notes";
import TemplateNameDialog from "../template-name-dialog";
import TemplateExercise from "./template-exercise";
import TemplateAddExerciseButton from "./template-add-exercise-button";

interface TemplateEditorBodyProps {
  template: WorkoutTemplateData;
}

export default function TemplateEditorBody({
  template,
}: TemplateEditorBodyProps) {
  const [templateNotesOpen, setTemplateNotesOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const updateTemplate = useUpdateWorkoutTemplate();

  const handleRename = (name: string) => {
    updateTemplate.mutate(
      { templateId: template.id, data: { name } },
      {
        onSuccess: () => {
          setNameDialogOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to rename template");
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{template.name}</h1>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit template name"
          onClick={() => setNameDialogOpen(true)}
        >
          <PencilIcon />
        </Button>
      </div>

      <TemplateNameDialog
        key={`${nameDialogOpen}-${template.name}`}
        isOpen={nameDialogOpen}
        onOpenChange={setNameDialogOpen}
        title="Rename Template"
        description="Change the name of this template."
        defaultName={template.name}
        submitLabel="Save"
        isPending={updateTemplate.isPending}
        onSubmit={handleRename}
      />

      <WorkoutNotes
        notes={template.notes}
        notesOpen={templateNotesOpen}
        onNotesOpenChange={setTemplateNotesOpen}
        onUpdate={(notes) =>
          updateTemplate.mutate({
            templateId: template.id,
            data: { notes },
          })
        }
        isEditing
        showPlaceholder
      />

      {template.workoutTemplateExercises.length > 0 && (
        <ul className="space-y-4">
          {template.workoutTemplateExercises.map((templateExercise, idx) => (
            <TemplateExercise
              key={templateExercise.id}
              exerciseNum={idx + 1}
              templateExercise={templateExercise}
            />
          ))}
        </ul>
      )}
      <TemplateAddExerciseButton templateId={template.id} />
    </div>
  );
}
