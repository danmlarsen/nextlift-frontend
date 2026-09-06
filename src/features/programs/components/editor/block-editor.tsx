"use client";

import { useState } from "react";
import { CopyIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateProgramDay,
  useDeleteProgramBlock,
  useDuplicateProgramBlock,
  useUpdateProgramBlock,
  useUpdateProgramWeek,
} from "@/api/programs/mutations";
import {
  type ProgramBlockData,
  type ProgramLevel,
  type ProgramScheduleMode,
} from "@/api/programs/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { spreadWeekdays } from "../../editor/draft";
import DayEditor from "./day-editor";
import { Field, NumberField, TextField } from "./inputs";

interface BlockEditorProps {
  programId: number;
  block: ProgramBlockData;
  blockCount: number;
  level: ProgramLevel;
  scheduleMode: ProgramScheduleMode;
}

export default function BlockEditor({
  programId,
  block,
  blockCount,
  level,
  scheduleMode,
}: BlockEditorProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateBlock = useUpdateProgramBlock();
  const deleteBlock = useDeleteProgramBlock();
  const duplicateBlock = useDuplicateProgramBlock();
  const updateWeek = useUpdateProgramWeek();
  const createDay = useCreateProgramDay();

  const patchBlock = (data: Parameters<typeof updateBlock.mutate>[0]["data"]) =>
    updateBlock.mutate(
      { programId, blockId: block.id, data },
      {
        onError: (error) =>
          toast.error(error.message || "Could not update the block"),
      },
    );

  const handleAddDay = () => {
    const nextIndex = block.days.length;
    const weekday =
      scheduleMode === "CALENDAR"
        ? (spreadWeekdays(nextIndex + 1).find(
            (candidate) => !block.days.some((day) => day.weekday === candidate),
          ) ?? null)
        : null;
    createDay.mutate(
      {
        programId,
        blockId: block.id,
        data: { name: `Day ${nextIndex + 1}`, weekday },
      },
      {
        onError: (error) => toast.error(error.message || "Could not add a day"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <div className="grid grid-cols-[2fr_2fr_1fr] gap-2">
          <Field label="Block name" htmlFor={`block-${block.id}-name`}>
            <TextField
              id={`block-${block.id}-name`}
              className="h-9 text-sm"
              value={block.name}
              maxLength={50}
              onCommit={(name) => patchBlock({ name: name || block.name })}
            />
          </Field>
          <Field label="Focus" htmlFor={`block-${block.id}-focus`}>
            <TextField
              id={`block-${block.id}-focus`}
              className="h-9 text-sm"
              placeholder="e.g. Accumulation"
              value={block.focus ?? ""}
              maxLength={100}
              onCommit={(focus) => patchBlock({ focus: focus || null })}
            />
          </Field>
          <Field label="Weeks" htmlFor={`block-${block.id}-weeks`}>
            <NumberField
              id={`block-${block.id}-weeks`}
              min={1}
              max={52}
              step={1}
              value={block.weeks.length}
              onCommit={(value) => {
                if (value && value !== block.weeks.length)
                  patchBlock({ weeks: value });
              }}
            />
          </Field>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Duplicate block ${block.name}`}
            disabled={duplicateBlock.isPending}
            onClick={() =>
              duplicateBlock.mutate(
                { programId, blockId: block.id },
                {
                  onError: (error) =>
                    toast.error(error.message || "Could not duplicate"),
                },
              )
            }
          >
            <CopyIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete block ${block.name}`}
            disabled={blockCount <= 1}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="text-destructive size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="px-2 py-1 text-left font-medium">Week</th>
              <th className="px-2 py-1 text-left font-medium">Label</th>
              <th className="px-2 py-1 font-medium">Deload</th>
              <th className="px-2 py-1 font-medium">Sets ×</th>
              <th className="px-2 py-1 font-medium">Load ×</th>
            </tr>
          </thead>
          <tbody>
            {block.weeks.map((week) => {
              const patchWeek = (
                data: Parameters<typeof updateWeek.mutate>[0]["data"],
              ) =>
                updateWeek.mutate(
                  {
                    programId,
                    blockId: block.id,
                    weekInBlock: week.weekInBlock,
                    data,
                  },
                  {
                    onError: (error) =>
                      toast.error(error.message || "Could not update the week"),
                  },
                );
              return (
                <tr key={week.id}>
                  <td className="px-2 py-1 font-medium">{week.weekInBlock}</td>
                  <td className="px-2 py-1">
                    <TextField
                      aria-label={`Week ${week.weekInBlock} label`}
                      className="h-8 min-w-24 text-xs"
                      placeholder="optional"
                      value={week.label ?? ""}
                      maxLength={50}
                      onCommit={(label) => patchWeek({ label: label || null })}
                    />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <Checkbox
                      aria-label={`Week ${week.weekInBlock} deload`}
                      checked={week.isDeload}
                      onCheckedChange={(checked) =>
                        patchWeek({
                          isDeload: !!checked,
                          // A deload defaults to half the sets at 60 % load
                          ...(checked &&
                          week.volumeMultiplier === 1 &&
                          week.intensityMultiplier === 1
                            ? {
                                volumeMultiplier: 0.5,
                                intensityMultiplier: 0.6,
                              }
                            : {}),
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-1">
                    <NumberField
                      aria-label={`Week ${week.weekInBlock} volume multiplier`}
                      className="h-8 w-16 text-xs"
                      min={0.1}
                      max={2}
                      step={0.1}
                      value={week.volumeMultiplier}
                      onCommit={(value) =>
                        patchWeek({ volumeMultiplier: value ?? 1 })
                      }
                    />
                  </td>
                  <td className="px-2 py-1">
                    <NumberField
                      aria-label={`Week ${week.weekInBlock} intensity multiplier`}
                      className="h-8 w-16 text-xs"
                      min={0.1}
                      max={1.5}
                      step={0.05}
                      value={week.intensityMultiplier}
                      onCommit={(value) =>
                        patchWeek({ intensityMultiplier: value ?? 1 })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        {block.days.map((day) => (
          <DayEditor
            key={day.id}
            programId={programId}
            day={day}
            weeks={block.weeks.length}
            level={level}
            scheduleMode={scheduleMode}
            canDelete
          />
        ))}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddDay}
          disabled={createDay.isPending || block.days.length >= 14}
        >
          <PlusIcon /> Add day
        </Button>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          setDeleteOpen(false);
          deleteBlock.mutate({ programId, blockId: block.id });
        }}
        title={`Delete block ${block.name}?`}
        text="Its weeks, days and exercises are removed."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
