"use client";

import { useEffect, useState } from "react";
import {
  CheckIcon,
  LoaderIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  useDeleteProgramDay,
  useImportTemplateIntoDay,
  useUpdateProgramDay,
} from "@/api/programs/mutations";
import {
  type ProgramDayData,
  type ProgramLevel,
  type ProgramScheduleMode,
} from "@/api/programs/types";
import { type ExerciseData } from "@/api/exercises/types";
import { useWorkoutTemplates } from "@/api/workout-templates/queries";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import ExercisesView from "@/features/exercises/components/exercises-view/exercises-view";
import { WEEKDAY_LABELS } from "@/lib/program-format";
import {
  draftFromDay,
  moveItem,
  newExerciseDraft,
  type ExerciseDraft,
} from "../../editor/draft";
import { useDayAutosave } from "../../editor/use-day-autosave";
import ExerciseEditor from "./exercise-editor";
import { NativeSelect, TextField } from "./inputs";

interface DayEditorProps {
  programId: number;
  day: ProgramDayData;
  weeks: number;
  level: ProgramLevel;
  scheduleMode: ProgramScheduleMode;
  canDelete: boolean;
}

/**
 * One program day: name/weekday save on blur, exercises and sets live in a
 * local draft that is autosaved as a whole. The draft is re-read from the
 * server only after a server-side import, so typing is never clobbered.
 */
export default function DayEditor({
  programId,
  day,
  weeks,
  level,
  scheduleMode,
  canDelete,
}: DayEditorProps) {
  const [draft, setDraft] = useState<ExerciseDraft[]>(() => draftFromDay(day));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resyncToken, setResyncToken] = useState(0);
  const { save, status, error } = useDayAutosave(programId, day.id);
  const updateDay = useUpdateProgramDay();
  const deleteDay = useDeleteProgramDay();
  const importTemplate = useImportTemplateIntoDay();
  const templates = useWorkoutTemplates();

  // Re-read the server content after an import appended exercises.
  useEffect(() => {
    if (resyncToken > 0) setDraft(draftFromDay(day));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resyncToken]);

  const change = (next: ExerciseDraft[]) => {
    setDraft(next);
    save(next);
  };

  const handlePick = (_id: number, exercise: ExerciseData) => {
    setPickerOpen(false);
    change([...draft, newExerciseDraft(exercise, level)]);
  };

  const handleImport = (templateId: number) => {
    importTemplate.mutate(
      { programId, dayId: day.id, templateId },
      {
        onSuccess: (program) => {
          setImportOpen(false);
          const updated = program.blocks
            .flatMap((block) => block.days)
            .find((candidate) => candidate.id === day.id);
          if (updated) {
            setDraft(draftFromDay(updated));
          } else {
            setResyncToken((token) => token + 1);
          }
          toast.success("Template imported");
        },
        onError: (mutationError) =>
          toast.error(mutationError.message || "Import failed"),
      },
    );
  };

  return (
    <section className="space-y-3 rounded-xl border p-3">
      <div className="flex items-center gap-2">
        <TextField
          aria-label="Day name"
          className="h-9 font-semibold"
          value={day.name}
          maxLength={50}
          onCommit={(name) =>
            updateDay.mutate({
              programId,
              dayId: day.id,
              data: { name: name || day.name },
            })
          }
        />
        {scheduleMode === "CALENDAR" && (
          <NativeSelect
            aria-label={`Weekday for ${day.name}`}
            className="w-24"
            value={day.weekday ?? ""}
            onChange={(event) =>
              updateDay.mutate({
                programId,
                dayId: day.id,
                data: {
                  weekday:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                },
              })
            }
          >
            <option value="">Day?</option>
            {WEEKDAY_LABELS.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </NativeSelect>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`${day.name} actions`}
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setImportOpen(true)}>
              Import from template
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              disabled={!canDelete}
              onSelect={() => setDeleteOpen(true)}
            >
              Delete day
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {draft.length === 0 && (
        <p className="text-muted-foreground py-2 text-center text-sm">
          No exercises yet. Add one, or import a template.
        </p>
      )}
      <div className="space-y-3">
        {draft.map((exercise, index) => (
          <ExerciseEditor
            key={exercise.localId}
            index={index}
            count={draft.length}
            exercise={exercise}
            weeks={weeks}
            level={level}
            onChange={(next) =>
              change(
                draft.map((candidate) =>
                  candidate.localId === next.localId ? next : candidate,
                ),
              )
            }
            onMove={(direction) => change(moveItem(draft, index, direction))}
            onRemove={() =>
              change(
                draft.filter(
                  (candidate) => candidate.localId !== exercise.localId,
                ),
              )
            }
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
          disabled={draft.length >= 15}
        >
          <PlusIcon /> Add exercise
        </Button>
        <p
          className="text-muted-foreground flex items-center gap-1 text-xs"
          aria-live="polite"
        >
          {status === "saving" && (
            <>
              <LoaderIcon className="size-3 animate-spin" /> Saving…
            </>
          )}
          {status === "saved" && (
            <>
              <CheckIcon className="size-3" /> Saved
            </>
          )}
          {status === "error" && (
            <span className="text-destructive">{error}</span>
          )}
        </p>
      </div>

      <ResponsiveModal
        isOpen={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Add exercise"
        description={`Pick an exercise for ${day.name}`}
        content={
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">Add exercise to {day.name}</h2>
            <ExercisesView onExerciseClick={handlePick} />
          </div>
        }
      />

      <ResponsiveModal
        isOpen={importOpen}
        onOpenChange={setImportOpen}
        title="Import template"
        description={`Append a template's exercises to ${day.name}`}
        content={
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">Import into {day.name}</h2>
            <p className="text-muted-foreground text-sm">
              The template&apos;s exercises and sets are appended with fixed targets;
              pick a progression for each afterwards.
            </p>
            <ul className="space-y-2">
              {templates.isLoading &&
                Array.from({ length: 2 }).map((_, index) => (
                  <li key={index}>
                    <Skeleton className="h-12 rounded-md" />
                  </li>
                ))}
              {templates.isSuccess && templates.data.length === 0 && (
                <li className="text-muted-foreground text-sm">
                  No templates yet.
                </li>
              )}
              {templates.isSuccess &&
                templates.data.map((template) => (
                  <li key={template.id} className="grid">
                    <Button
                      variant="outline"
                      className="h-auto w-full justify-between py-3"
                      disabled={importTemplate.isPending}
                      onClick={() => handleImport(template.id)}
                    >
                      <span className="truncate font-semibold">
                        {importTemplate.isPending &&
                          importTemplate.variables?.templateId ===
                            template.id && <Spinner className="mr-2 inline" />}
                        {template.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {template.workoutTemplateExercises.length} exercises
                      </span>
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
        }
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          setDeleteOpen(false);
          deleteDay.mutate({ programId, dayId: day.id });
        }}
        title={`Delete ${day.name}?`}
        confirmText="Delete"
        variant="destructive"
      />
    </section>
  );
}
