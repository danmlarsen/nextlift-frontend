"use client";

import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkoutExerciseOptionsButtonProps {
  onOpenNotes: () => void;
  onDelete: () => void;
}

export default function WorkoutExerciseOptionsButton({
  onOpenNotes,
  onDelete,
}: WorkoutExerciseOptionsButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Button onClick={onOpenNotes} variant="ghost">
            Add Exercise Notes
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button onClick={onDelete} variant="ghost">
            Remove Exercise
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
