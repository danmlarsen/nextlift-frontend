"use client";

import { useWorkoutTemplates } from "@/api/workout-templates/queries";
import TemplateCard, { TemplateCardSkeleton } from "./template-card";
import NewTemplateButton from "./new-template-button";
import TemplateEditorProvider from "./template-editor/template-editor-provider";

export default function TemplatesView() {
  const { data, isLoading, isSuccess, isError } = useWorkoutTemplates();

  return (
    <TemplateEditorProvider>
      <div className="mx-auto w-full max-w-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Templates {isSuccess && data.length > 0 ? `(${data.length})` : ""}
          </h2>
          <NewTemplateButton />
        </div>
        <ul className="space-y-4">
          {isLoading &&
            Array.from({ length: 2 }).map((_, index) => (
              <TemplateCardSkeleton key={`initial-${index}`} />
            ))}
          {isSuccess && data.length === 0 && (
            <li className="text-muted-foreground py-8 text-center">
              No templates yet. Create one from scratch or save a completed
              workout as a template.
            </li>
          )}
          {isSuccess &&
            data.map((template) => (
              <li key={template.id}>
                <TemplateCard template={template} />
              </li>
            ))}
          {isError && (
            <li className="text-destructive">
              An unexpected error occurred while loading workout templates.
              Please try again later.
            </li>
          )}
        </ul>
      </div>
    </TemplateEditorProvider>
  );
}
