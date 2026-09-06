"use client";

import { CopyPlusIcon, XIcon } from "lucide-react";

import {
  type ProgressionParams,
  type ProgressionStrategy,
} from "@/api/programs/types";
import { WORKOUT_SET_TYPES, type WorkoutSetType } from "@/api/workouts/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { localId, newSetDraft, type SetDraft } from "../../editor/draft";
import { NativeSelect } from "./inputs";

interface SetRowsEditorProps {
  idPrefix: string;
  sets: SetDraft[];
  weeks: number;
  strategy: ProgressionStrategy;
  params: ProgressionParams | null;
  onChange: (sets: SetDraft[]) => void;
}

/** Which load column a strategy prescribes. */
export function loadMode(
  strategy: ProgressionStrategy,
  params: ProgressionParams | null,
): "percent" | "kg" | "both" {
  if (strategy === "PERCENT_TM") return "percent";
  if (strategy === "NONE") {
    return params?.strategy === "NONE" &&
      params.basis &&
      params.basis !== "FIXED"
      ? "percent"
      : "kg";
  }
  // Linear / double / RPE work from state; a percent only applies to warm-ups
  // and back-offs, a fixed kg is unusual — expose the percent column only.
  return "percent";
}

const cell = "h-8 min-w-14 px-1 text-center text-sm";

export default function SetRowsEditor({
  idPrefix,
  sets,
  weeks,
  strategy,
  params,
  onChange,
}: SetRowsEditorProps) {
  const mode = loadMode(strategy, params);

  const update = (localIdToUpdate: string, patch: Partial<SetDraft>) =>
    onChange(
      sets.map((set) =>
        set.localId === localIdToUpdate ? { ...set, ...patch } : set,
      ),
    );

  const remove = (localIdToRemove: string) =>
    onChange(sets.filter((set) => set.localId !== localIdToRemove));

  const addSet = () => {
    const last = sets[sets.length - 1];
    onChange([
      ...sets,
      last
        ? { ...last, localId: localId(), isAmrap: false }
        : newSetDraft({ repsMin: "5", repsMax: "5" }),
    ]);
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="px-1 text-left font-medium">Set</th>
              {weeks > 1 && <th className="px-1 font-medium">Week</th>}
              <th className="px-1 font-medium">Reps</th>
              {(mode === "percent" || mode === "both") && (
                <th className="px-1 font-medium">%</th>
              )}
              {(mode === "kg" || mode === "both") && (
                <th className="px-1 font-medium">kg</th>
              )}
              <th className="px-1 font-medium">RPE</th>
              <th className="px-1 font-medium">AMRAP</th>
              <th className="px-1 font-medium">Rest s</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sets.map((set, index) => (
              <tr key={set.localId}>
                <td className="px-1 py-0.5">
                  <NativeSelect
                    aria-label={`Set ${index + 1} type`}
                    className="h-8 w-20 px-1 text-xs capitalize"
                    value={set.type}
                    onChange={(event) =>
                      update(set.localId, {
                        type: event.target.value as WorkoutSetType,
                      })
                    }
                  >
                    {WORKOUT_SET_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {index + 1} · {type}
                      </option>
                    ))}
                  </NativeSelect>
                </td>
                {weeks > 1 && (
                  <td className="px-1 py-0.5">
                    <NativeSelect
                      aria-label={`Set ${index + 1} week`}
                      className="h-8 w-16 px-1 text-xs"
                      value={set.weekInBlock ?? ""}
                      onChange={(event) =>
                        update(set.localId, {
                          weekInBlock:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        })
                      }
                    >
                      <option value="">All</option>
                      {Array.from({ length: weeks }, (_, week) => (
                        <option key={week + 1} value={week + 1}>
                          {week + 1}
                        </option>
                      ))}
                    </NativeSelect>
                  </td>
                )}
                <td className="px-1 py-0.5">
                  <div className="flex items-center gap-1">
                    <Input
                      aria-label={`Set ${index + 1} min reps`}
                      type="number"
                      inputMode="numeric"
                      className={cell}
                      placeholder="min"
                      value={set.repsMin}
                      onChange={(event) =>
                        update(set.localId, { repsMin: event.target.value })
                      }
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      aria-label={`Set ${index + 1} max reps`}
                      type="number"
                      inputMode="numeric"
                      className={cell}
                      placeholder="max"
                      value={set.repsMax}
                      onChange={(event) =>
                        update(set.localId, { repsMax: event.target.value })
                      }
                    />
                  </div>
                </td>
                {(mode === "percent" || mode === "both") && (
                  <td className="px-1 py-0.5">
                    <Input
                      aria-label={`Set ${index + 1} percent`}
                      type="number"
                      inputMode="decimal"
                      className={cell}
                      placeholder="%"
                      value={set.percent}
                      onChange={(event) =>
                        update(set.localId, { percent: event.target.value })
                      }
                    />
                  </td>
                )}
                {(mode === "kg" || mode === "both") && (
                  <td className="px-1 py-0.5">
                    <Input
                      aria-label={`Set ${index + 1} weight`}
                      type="number"
                      inputMode="decimal"
                      className={cell}
                      placeholder="kg"
                      value={set.weight}
                      onChange={(event) =>
                        update(set.localId, { weight: event.target.value })
                      }
                    />
                  </td>
                )}
                <td className="px-1 py-0.5">
                  <Input
                    aria-label={`Set ${index + 1} target RPE`}
                    type="number"
                    inputMode="decimal"
                    step={0.5}
                    min={6}
                    max={10}
                    className={cell}
                    placeholder="–"
                    value={set.targetRpe}
                    onChange={(event) =>
                      update(set.localId, { targetRpe: event.target.value })
                    }
                  />
                </td>
                <td className="px-1 py-0.5 text-center">
                  <Checkbox
                    aria-label={`Set ${index + 1} AMRAP`}
                    checked={set.isAmrap}
                    onCheckedChange={(checked) =>
                      update(set.localId, { isAmrap: !!checked })
                    }
                  />
                </td>
                <td className="px-1 py-0.5">
                  <Input
                    aria-label={`Set ${index + 1} rest seconds`}
                    type="number"
                    inputMode="numeric"
                    className={cell}
                    placeholder="–"
                    value={set.restSeconds}
                    onChange={(event) =>
                      update(set.localId, { restSeconds: event.target.value })
                    }
                  />
                </td>
                <td className="px-1 py-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Remove set ${index + 1}`}
                    onClick={() => remove(set.localId)}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={addSet}
        disabled={sets.length >= 120}
        id={`${idPrefix}-add-set`}
      >
        <CopyPlusIcon /> Add set
      </Button>
    </div>
  );
}
