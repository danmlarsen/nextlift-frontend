"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteWorkout } from "@/api/workouts/workout-mutations";
import { useCreateTemplateFromWorkout } from "@/api/workout-templates/mutations";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import TemplateNameDialog from "@/features/workout-templates/components/template-name-dialog";

interface WorkoutHistoryItemDropdownMenuProps {
  workoutId: number;
  workoutTitle: string;
  onClickEdit: () => void;
}

export default function WorkoutHistoryItemDropdownMenu({
  workoutId,
  workoutTitle,
  onClickEdit,
}: WorkoutHistoryItemDropdownMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const deleteWorkout = useDeleteWorkout();
  const createTemplateFromWorkout = useCreateTemplateFromWorkout();

  const handleDelete = () => {
    deleteWorkout.mutate(workoutId, {
      onSuccess: () => {
        toast.success(`Successfully deleted workout`);
      },
    });
    setDeleteDialogOpen(false);
  };

  const handleSaveAsTemplate = (name: string) => {
    createTemplateFromWorkout.mutate(
      { workoutId, name },
      {
        onSuccess: () => {
          setSaveTemplateDialogOpen(false);
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
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Workout?"
        confirmText="Delete"
        variant="destructive"
      />

      <TemplateNameDialog
        key={String(saveTemplateDialogOpen)}
        isOpen={saveTemplateDialogOpen}
        onOpenChange={setSaveTemplateDialogOpen}
        title="Save as Template"
        description="Save this workout's exercises and sets as a reusable template."
        defaultName={workoutTitle}
        submitLabel="Save"
        isPending={createTemplateFromWorkout.isPending}
        onSubmit={handleSaveAsTemplate}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onClickEdit}>
            Edit Workout
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSaveTemplateDialogOpen(true)}>
            Save as Template
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)}>
            Delete Workout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
