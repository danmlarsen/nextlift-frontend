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
import { useDeleteWorkoutTemplate } from "@/api/workout-templates/mutations";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useTemplateEditor } from "./template-editor/template-editor-provider";

interface TemplateCardDropdownMenuProps {
  templateId: number;
}

export default function TemplateCardDropdownMenu({
  templateId,
}: TemplateCardDropdownMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteTemplate = useDeleteWorkoutTemplate();
  const { openTemplate } = useTemplateEditor();

  const handleDelete = () => {
    deleteTemplate.mutate(templateId, {
      onSuccess: () => {
        toast.success(`Successfully deleted template`);
      },
    });
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Template?"
        confirmText="Delete"
        variant="destructive"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => openTemplate(templateId)}>
            Edit Template
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)}>
            Delete Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
