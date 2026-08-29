"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCreateWorkoutTemplate } from "@/api/workout-templates/mutations";
import { useHaptics } from "@/hooks/use-haptics";
import TemplateNameDialog from "./template-name-dialog";
import { useTemplateEditor } from "./template-editor/template-editor-provider";

export default function NewTemplateButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const createTemplate = useCreateWorkoutTemplate();
  const { openTemplate } = useTemplateEditor();
  const { vibrate } = useHaptics();

  const handleCreate = (name: string) => {
    createTemplate.mutate(
      { name },
      {
        onSuccess: (newTemplate) => {
          setDialogOpen(false);
          openTemplate(newTemplate.id);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create template");
        },
      },
    );
  };

  return (
    <>
      <TemplateNameDialog
        key={String(dialogOpen)}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        title="New Template"
        description="Give your template a name. You can add exercises next."
        submitLabel="Create"
        isPending={createTemplate.isPending}
        onSubmit={handleCreate}
      />
      <Button
        onClick={() => {
          vibrate();
          setDialogOpen(true);
        }}
      >
        New Template
      </Button>
    </>
  );
}
