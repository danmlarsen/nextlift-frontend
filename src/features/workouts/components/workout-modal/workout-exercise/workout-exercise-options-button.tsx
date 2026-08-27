"use client";

import { MoreHorizontalIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkoutExerciseOptionsButtonProps {
  canEdit: boolean;
  isFavorite: boolean;
  favoriteDisabled: boolean;
  onToggleFavorite: () => void;
  onOpenNotes: () => void;
  onDelete: () => void;
}

export default function WorkoutExerciseOptionsButton({
  canEdit,
  isFavorite,
  favoriteDisabled,
  onToggleFavorite,
  onOpenNotes,
  onDelete,
}: WorkoutExerciseOptionsButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Exercise options">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={favoriteDisabled}
          onSelect={onToggleFavorite}
        >
          <StarIcon
            className={isFavorite ? "fill-amber-400 text-amber-500" : ""}
          />
          {isFavorite ? "Remove from favorites" : "Add to favorites"}
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem onSelect={onOpenNotes}>
            Add Exercise Notes
          </DropdownMenuItem>
        )}
        {canEdit && (
          <DropdownMenuItem onSelect={onDelete} variant="destructive">
            Remove Exercise
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
