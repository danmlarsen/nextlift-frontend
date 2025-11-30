"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import WorkoutNotesDialog from "./workout-notes-dialog";
import WorkoutNotesDeleteDialog from "./workout-notes-delete-dialog";
import { useWorkoutModal } from "../workout-modal-provider";

interface WorkoutNotesProps {
  notes: string | null;
  notesOpen: boolean;
  onNotesOpenChange: (open: boolean) => void;
  onUpdate: (notes: string) => void;
  showPlaceholder?: boolean;
}

export default function WorkoutNotes({
  notes,
  notesOpen,
  onNotesOpenChange,
  onUpdate,
  showPlaceholder = false,
}: WorkoutNotesProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { isEditing } = useWorkoutModal();

  const handleUpdateNotes = (notes: string) => {
    onUpdate(notes);
  };

  const handleDeleteNotes = () => {
    setDeleteDialogOpen(false);
    onUpdate("");
  };

  return (
    <>
      <WorkoutNotesDialog
        key={`${notesOpen}-${notes}`}
        isOpen={notesOpen}
        onOpenChange={onNotesOpenChange}
        notes={notes}
        onConfirm={handleUpdateNotes}
      />

      <WorkoutNotesDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteNotes}
      />

      {!notes && showPlaceholder && isEditing && (
        <Button
          onClick={() => onNotesOpenChange(true)}
          className="text-muted-foreground flex w-full items-center justify-start gap-2"
          variant="ghost"
        >
          <PencilIcon />
          <p>Add notes here</p>
        </Button>
      )}

      {notes && (
        <div>
          <p className="break-words whitespace-pre-wrap">{notes}</p>
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button onClick={() => onNotesOpenChange(true)} variant="ghost">
                <PencilIcon />
                Edit
              </Button>
              <Button onClick={() => setDeleteDialogOpen(true)} variant="ghost">
                <TrashIcon />
                Delete
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
