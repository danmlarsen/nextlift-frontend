"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";

import {
  useDeleteProgram,
  useDuplicateProgram,
} from "@/api/programs/mutations";
import { type ProgramSummaryData } from "@/api/programs/types";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProgramCardMenuProps {
  program: ProgramSummaryData;
}

export default function ProgramCardMenu({ program }: ProgramCardMenuProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const duplicateProgram = useDuplicateProgram();
  const deleteProgram = useDeleteProgram();

  const handleDuplicate = () => {
    duplicateProgram.mutate(program.id, {
      onSuccess: (copy) => {
        toast.success("Copy saved to your programs");
        router.push(`/app/programs/${copy.id}/edit`);
      },
      onError: (error) =>
        toast.error(error.message || "Could not copy the program"),
    });
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    deleteProgram.mutate(program.id, {
      onSuccess: () => toast.success("Program deleted"),
      onError: (error) =>
        toast.error(error.message || "Could not delete the program"),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`${program.name} actions`}
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {program.isOwner && (
            <DropdownMenuItem asChild>
              <Link href={`/app/programs/${program.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={handleDuplicate}>
            {program.isOwner ? "Duplicate" : "Customize a copy"}
          </DropdownMenuItem>
          {program.isOwner && (
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => setDeleteOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={`Delete ${program.name}?`}
        text="Anyone currently following it keeps their copy."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
