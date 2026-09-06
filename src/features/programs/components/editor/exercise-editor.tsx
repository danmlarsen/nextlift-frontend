"use client";

import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";

import { type ProgramLevel } from "@/api/programs/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultSets, type ExerciseDraft } from "../../editor/draft";
import { Field, NativeSelect } from "./inputs";
import SetRowsEditor from "./set-rows-editor";
import StrategyParamsForm from "./strategy-params-form";

const ROUNDING_OPTIONS = [0.5, 1, 1.25, 2, 2.5, 5];

interface ExerciseEditorProps {
  index: number;
  count: number;
  exercise: ExerciseDraft;
  weeks: number;
  level: ProgramLevel;
  onChange: (exercise: ExerciseDraft) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export default function ExerciseEditor({
  index,
  count,
  exercise,
  weeks,
  onChange,
  onMove,
  onRemove,
}: ExerciseEditorProps) {
  const idPrefix = `ex-${exercise.localId}`;

  return (
    <Card className="gap-3 py-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate font-semibold">
            {index + 1}. {exercise.exercise.name}
          </h4>
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Move ${exercise.exercise.name} up`}
              disabled={index === 0}
              onClick={() => onMove(-1)}
            >
              <ArrowUpIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Move ${exercise.exercise.name} down`}
              disabled={index === count - 1}
              onClick={() => onMove(1)}
            >
              <ArrowDownIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${exercise.exercise.name}`}
              onClick={onRemove}
            >
              <Trash2Icon className="text-destructive size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <StrategyParamsForm
          idPrefix={idPrefix}
          strategy={exercise.strategy}
          params={exercise.progression}
          onStrategyChange={(strategy, params) =>
            onChange({
              ...exercise,
              strategy,
              progression: params,
              // Keep authored rows unless the exercise still has the defaults.
              sets:
                exercise.sets.length === 0
                  ? defaultSets(strategy)
                  : exercise.sets,
            })
          }
          onParamsChange={(params) =>
            onChange({ ...exercise, progression: params })
          }
        />

        <div className="grid grid-cols-3 gap-2">
          <Field
            label="Key"
            htmlFor={`${idPrefix}-key`}
            hint="Same key = shared numbers"
          >
            <Input
              id={`${idPrefix}-key`}
              className="h-9 text-sm"
              value={exercise.progressionKey}
              onChange={(event) =>
                onChange({
                  ...exercise,
                  progressionKey: event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_-]/g, "-"),
                })
              }
            />
          </Field>
          <Field label="Round to" htmlFor={`${idPrefix}-rounding`}>
            <NativeSelect
              id={`${idPrefix}-rounding`}
              value={exercise.roundingKg}
              onChange={(event) =>
                onChange({ ...exercise, roundingKg: event.target.value })
              }
            >
              <option value="">2.5 kg (default)</option>
              {ROUNDING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} kg
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Rest (s)" htmlFor={`${idPrefix}-rest`}>
            <Input
              id={`${idPrefix}-rest`}
              type="number"
              inputMode="numeric"
              className="h-9 text-sm"
              placeholder="e.g. 120"
              value={exercise.restSeconds}
              onChange={(event) =>
                onChange({ ...exercise, restSeconds: event.target.value })
              }
            />
          </Field>
        </div>

        <SetRowsEditor
          idPrefix={idPrefix}
          sets={exercise.sets}
          weeks={weeks}
          strategy={exercise.strategy}
          params={exercise.progression}
          onChange={(sets) => onChange({ ...exercise, sets })}
        />
      </CardContent>
    </Card>
  );
}
