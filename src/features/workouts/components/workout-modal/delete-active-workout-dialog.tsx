"use client";

import ConfirmDialog from "@/components/ui/confirm-dialog";

interface DeleteActiveWorkoutDialogProps {
  isOpen: boolean;
  onOpenChanged: (newState: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteActiveWorkoutDialog({
  isOpen,
  onOpenChanged,
  onConfirm,
}: DeleteActiveWorkoutDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChanged}
      onConfirm={() => {
        onConfirm();
        onOpenChanged(false);
      }}
      title="Discard Workout"
      variant="destructive"
    />
  );
}
