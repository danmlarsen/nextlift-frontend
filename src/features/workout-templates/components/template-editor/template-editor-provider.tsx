"use client";

import { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useWorkoutTemplate } from "@/api/workout-templates/queries";
import { type WorkoutTemplateData } from "@/api/workout-templates/types";
import { cn } from "@/lib/utils";
import TemplateEditorBody from "./template-editor-body";

interface TemplateEditorContextValue {
  template?: WorkoutTemplateData;
  openTemplate: (templateId: number) => void;
  closeTemplate: () => void;
}

const TemplateEditorContext = createContext<TemplateEditorContextValue | null>(
  null,
);

interface TemplateEditorProviderProps {
  children: React.ReactNode;
}

// Templates have no lifecycle (no status, timer, completion or view mode), so
// this is a deliberately leaner parallel of the workout modal provider: the
// editor is always editable and only ever opened from the templates page.
export default function TemplateEditorProvider({
  children,
}: TemplateEditorProviderProps) {
  const [isOpen, setIsOpen] = useSearchParamState("template-modal");
  const [templateId, setTemplateId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const {
    data: template,
    isSuccess,
    isLoading,
    isError,
  } = useWorkoutTemplate(templateId || undefined);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const openTemplate = (templateId: number) => {
    setTemplateId(templateId);
    setIsOpen(true);
  };

  const closeTemplate = () => {
    setIsOpen(false);
    if (templateId) {
      queryClient.invalidateQueries({
        queryKey: ["workoutTemplate", { id: templateId }],
      });
      queryClient.invalidateQueries({ queryKey: ["workoutTemplates"] });
    }
  };

  return (
    <TemplateEditorContext.Provider
      value={{ template, openTemplate, closeTemplate }}
    >
      {children}

      <ResponsiveModal
        isOpen={isOpen && !!templateId}
        onOpenChange={closeTemplate}
        content={
          <>
            {templateId && isLoading && (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            )}
            {isError && (
              <div className="text-muted-foreground flex items-center justify-center py-8">
                Error loading template
              </div>
            )}
            {isSuccess && template && (
              <div
                className={cn(
                  "grid h-[calc(100dvh-42px)] grid-rows-[auto_1fr] pb-4",
                  isDesktop && "h-[100dvh] pt-4",
                )}
              >
                <div className="flex items-center justify-end p-4">
                  <Button variant="outline" onClick={closeTemplate}>
                    Close
                  </Button>
                </div>

                <div className="overflow-y-auto px-4">
                  <TemplateEditorBody template={template} />
                </div>
              </div>
            )}
          </>
        }
        title={template?.name ?? "Loading..."}
        description={`Editing template ${template?.name ?? ""}`}
      />
    </TemplateEditorContext.Provider>
  );
}

export const useTemplateEditor = () => {
  const context = useContext(TemplateEditorContext);
  if (!context) {
    throw new Error(
      "useTemplateEditor must be used within TemplateEditorProvider",
    );
  }
  return context;
};
