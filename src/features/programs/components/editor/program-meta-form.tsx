"use client";

import { toast } from "sonner";

import { useUpdateProgram } from "@/api/programs/mutations";
import {
  PROGRAM_GOALS,
  PROGRAM_LEVELS,
  type ProgramData,
  type UpdateProgramDto,
} from "@/api/programs/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  PROGRAM_GOAL_LABELS,
  PROGRAM_LEVEL_LABELS,
} from "@/lib/program-format";
import { Field, NativeSelect, NumberField, TextField } from "./inputs";

interface ProgramMetaFormProps {
  program: ProgramData;
}

export default function ProgramMetaForm({ program }: ProgramMetaFormProps) {
  const updateProgram = useUpdateProgram();

  const patch = (data: UpdateProgramDto) =>
    updateProgram.mutate(
      { programId: program.id, data },
      { onError: (error) => toast.error(error.message || "Could not save") },
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field label="Name" htmlFor="program-name">
          <TextField
            id="program-name"
            value={program.name}
            maxLength={60}
            onCommit={(name) =>
              name.trim().length >= 2 && patch({ name: name.trim() })
            }
          />
        </Field>
        <Field label="Description" htmlFor="program-description">
          <Textarea
            id="program-description"
            defaultValue={program.description ?? ""}
            maxLength={1000}
            rows={3}
            onBlur={(event) => {
              const value = event.target.value.trim();
              if (value !== (program.description ?? ""))
                patch({ description: value || null });
            }}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Field label="Goal" htmlFor="program-goal">
            <NativeSelect
              id="program-goal"
              value={program.goal}
              onChange={(event) =>
                patch({ goal: event.target.value as ProgramData["goal"] })
              }
            >
              {PROGRAM_GOALS.map((goal) => (
                <option key={goal} value={goal}>
                  {PROGRAM_GOAL_LABELS[goal]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Level" htmlFor="program-level">
            <NativeSelect
              id="program-level"
              value={program.level}
              onChange={(event) =>
                patch({ level: event.target.value as ProgramData["level"] })
              }
            >
              {PROGRAM_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {PROGRAM_LEVEL_LABELS[level]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Days per week" htmlFor="program-days">
            <NumberField
              id="program-days"
              min={1}
              max={7}
              step={1}
              value={program.daysPerWeek}
              onCommit={(value) => value && patch({ daysPerWeek: value })}
            />
          </Field>
          <Field label="Schedule" htmlFor="program-schedule">
            <NativeSelect
              id="program-schedule"
              value={program.scheduleMode}
              onChange={(event) =>
                patch({
                  scheduleMode: event.target
                    .value as ProgramData["scheduleMode"],
                })
              }
            >
              <option value="SEQUENCE">Rotation (days in order)</option>
              <option value="CALENDAR">Fixed weekdays</option>
            </NativeSelect>
          </Field>
          <Field label="Length" htmlFor="program-duration">
            <NativeSelect
              id="program-duration"
              value={program.durationMode}
              onChange={(event) =>
                patch({
                  durationMode: event.target
                    .value as ProgramData["durationMode"],
                })
              }
            >
              <option value="FIXED">Fixed number of weeks</option>
              <option value="OPEN_ENDED">Repeats until stopped</option>
            </NativeSelect>
          </Field>
          <Field label="Effort shown as" htmlFor="program-effort">
            <NativeSelect
              id="program-effort"
              value={program.effortScale}
              onChange={(event) =>
                patch({
                  effortScale: event.target.value as ProgramData["effortScale"],
                })
              }
            >
              <option value="RPE">RPE (6–10)</option>
              <option value="RIR">RIR (reps in reserve)</option>
            </NativeSelect>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
