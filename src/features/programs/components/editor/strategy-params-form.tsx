"use client";

import { PlusIcon, XIcon } from "lucide-react";

import {
  type LinearStage,
  type ProgressionParams,
  type ProgressionStrategy,
} from "@/api/programs/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { STRATEGY_LABELS } from "@/lib/program-format";
import { defaultParams } from "../../editor/draft";
import { Field, NativeSelect, NumberField } from "./inputs";

const STRATEGY_HINTS: Record<ProgressionStrategy, string> = {
  LINEAR: "Add weight every session you complete all sets. Beginner programs.",
  DOUBLE: "Add weight once every set reaches the top of the rep range.",
  PERCENT_TM: "Loads are percentages of a training max that grows each cycle.",
  RPE: "Loads follow effort: top sets at a target RPE, or RIR that falls week by week.",
  NONE: "Fixed targets; can follow another slot's numbers via the same key.",
};

const DEFAULT_STAGES: LinearStage[] = [
  { sets: 5, reps: 3, amrapLast: true },
  { sets: 6, reps: 2, amrapLast: true },
  { sets: 10, reps: 1, amrapLast: true },
];

interface StrategyParamsFormProps {
  idPrefix: string;
  strategy: ProgressionStrategy;
  params: ProgressionParams | null;
  onStrategyChange: (
    strategy: ProgressionStrategy,
    params: ProgressionParams | null,
  ) => void;
  onParamsChange: (params: ProgressionParams) => void;
}

/** Strategy picker plus the parameter fields for the chosen strategy. */
export default function StrategyParamsForm({
  idPrefix,
  strategy,
  params,
  onStrategyChange,
  onParamsChange,
}: StrategyParamsFormProps) {
  return (
    <div className="space-y-3">
      <Field
        label="Progression"
        htmlFor={`${idPrefix}-strategy`}
        hint={STRATEGY_HINTS[strategy]}
      >
        <NativeSelect
          id={`${idPrefix}-strategy`}
          value={strategy}
          onChange={(event) => {
            const next = event.target.value as ProgressionStrategy;
            onStrategyChange(next, defaultParams(next));
          }}
        >
          {(Object.keys(STRATEGY_LABELS) as ProgressionStrategy[]).map(
            (option) => (
              <option key={option} value={option}>
                {STRATEGY_LABELS[option]}
              </option>
            ),
          )}
        </NativeSelect>
      </Field>

      {params?.strategy === "LINEAR" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Field label="Increment (kg)" htmlFor={`${idPrefix}-inc`}>
              <NumberField
                id={`${idPrefix}-inc`}
                min={0}
                max={50}
                step={0.5}
                value={params.incrementKg}
                onCommit={(value) =>
                  onParamsChange({ ...params, incrementKg: value ?? 0 })
                }
              />
            </Field>
            <Field label="Fails before back-off" htmlFor={`${idPrefix}-fails`}>
              <NumberField
                id={`${idPrefix}-fails`}
                min={1}
                max={10}
                step={1}
                value={params.failThreshold ?? 3}
                onCommit={(value) =>
                  onParamsChange({ ...params, failThreshold: value ?? 3 })
                }
              />
            </Field>
            <Field label="Back-off (%)" htmlFor={`${idPrefix}-deload`}>
              <NumberField
                id={`${idPrefix}-deload`}
                min={0}
                max={50}
                step={1}
                value={params.deloadPercent ?? 10}
                onCommit={(value) =>
                  onParamsChange({ ...params, deloadPercent: value ?? 10 })
                }
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={!!params.stages}
              onCheckedChange={(checked) =>
                onParamsChange({
                  ...params,
                  stages: checked ? DEFAULT_STAGES : undefined,
                  stageResetPercent: checked
                    ? (params.stageResetPercent ?? 85)
                    : undefined,
                })
              }
            />
            Fall back through set × rep stages before resetting (GZCLP style)
          </label>
          {params.stages && (
            <div className="space-y-2 rounded-lg border p-2">
              {params.stages.map((stage, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_auto_auto] items-end gap-2"
                >
                  <Field label="Sets">
                    <NumberField
                      aria-label={`Stage ${index + 1} sets`}
                      min={1}
                      max={20}
                      step={1}
                      value={stage.sets}
                      onCommit={(value) =>
                        onParamsChange({
                          ...params,
                          stages: params.stages!.map((s, i) =>
                            i === index ? { ...s, sets: value ?? s.sets } : s,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Reps">
                    <NumberField
                      aria-label={`Stage ${index + 1} reps`}
                      min={1}
                      max={100}
                      step={1}
                      value={stage.reps}
                      onCommit={(value) =>
                        onParamsChange({
                          ...params,
                          stages: params.stages!.map((s, i) =>
                            i === index ? { ...s, reps: value ?? s.reps } : s,
                          ),
                        })
                      }
                    />
                  </Field>
                  <label className="flex items-center gap-1 pb-2 text-xs">
                    <Checkbox
                      checked={!!stage.amrapLast}
                      onCheckedChange={(checked) =>
                        onParamsChange({
                          ...params,
                          stages: params.stages!.map((s, i) =>
                            i === index ? { ...s, amrapLast: !!checked } : s,
                          ),
                        })
                      }
                    />
                    last +
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove stage ${index + 1}`}
                    disabled={params.stages!.length <= 1}
                    onClick={() =>
                      onParamsChange({
                        ...params,
                        stages: params.stages!.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={params.stages.length >= 6}
                  onClick={() =>
                    onParamsChange({
                      ...params,
                      stages: [...params.stages!, { sets: 3, reps: 5 }],
                    })
                  }
                >
                  <PlusIcon /> Stage
                </Button>
                <Field label="Reset to (%)" className="ml-auto w-28">
                  <NumberField
                    aria-label="Reset percentage after the last stage"
                    min={50}
                    max={100}
                    step={1}
                    value={params.stageResetPercent ?? 85}
                    onCommit={(value) =>
                      onParamsChange({
                        ...params,
                        stageResetPercent: value ?? 85,
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={params.amrapRepsThreshold !== undefined}
              onCheckedChange={(checked) =>
                onParamsChange({
                  ...params,
                  amrapRepsThreshold: checked ? 25 : undefined,
                })
              }
            />
            Only progress when the AMRAP set reaches a rep target
          </label>
          {params.amrapRepsThreshold !== undefined && (
            <Field label="AMRAP reps needed" className="w-40">
              <NumberField
                aria-label="AMRAP reps needed"
                min={1}
                max={200}
                step={1}
                value={params.amrapRepsThreshold}
                onCommit={(value) =>
                  onParamsChange({ ...params, amrapRepsThreshold: value ?? 25 })
                }
              />
            </Field>
          )}
        </div>
      )}

      {params?.strategy === "DOUBLE" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Progress by" htmlFor={`${idPrefix}-mode`}>
            <NativeSelect
              id={`${idPrefix}-mode`}
              value={params.mode ?? "LOAD"}
              onChange={(event) =>
                onParamsChange({
                  ...params,
                  mode: event.target.value as "LOAD" | "REPS",
                })
              }
            >
              <option value="LOAD">Adding weight</option>
              <option value="REPS">Adding reps (bodyweight)</option>
            </NativeSelect>
          </Field>
          {(params.mode ?? "LOAD") === "LOAD" ? (
            <Field label="Increment (kg)" htmlFor={`${idPrefix}-inc`}>
              <NumberField
                id={`${idPrefix}-inc`}
                min={0}
                max={50}
                step={0.5}
                value={params.incrementKg}
                onCommit={(value) =>
                  onParamsChange({ ...params, incrementKg: value ?? 0 })
                }
              />
            </Field>
          ) : (
            <Field label="Reps added" htmlFor={`${idPrefix}-step`}>
              <NumberField
                id={`${idPrefix}-step`}
                min={1}
                max={10}
                step={1}
                value={params.repsStep ?? 1}
                onCommit={(value) =>
                  onParamsChange({ ...params, repsStep: value ?? 1 })
                }
              />
            </Field>
          )}
        </div>
      )}

      {params?.strategy === "PERCENT_TM" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Field label="TM (% of 1RM)" htmlFor={`${idPrefix}-tmpct`}>
              <NumberField
                id={`${idPrefix}-tmpct`}
                min={50}
                max={100}
                step={1}
                value={params.tmPercentOf1RM ?? 90}
                onCommit={(value) =>
                  onParamsChange({ ...params, tmPercentOf1RM: value ?? 90 })
                }
              />
            </Field>
            <Field label="TM increment (kg)" htmlFor={`${idPrefix}-tminc`}>
              <NumberField
                id={`${idPrefix}-tminc`}
                min={0}
                max={50}
                step={0.5}
                value={params.tmIncrementKg}
                onCommit={(value) =>
                  onParamsChange({ ...params, tmIncrementKg: value ?? 0 })
                }
              />
            </Field>
            <Field label="TM moves" htmlFor={`${idPrefix}-advance`}>
              <NativeSelect
                id={`${idPrefix}-advance`}
                value={params.tmAdvance ?? "CYCLE_END"}
                onChange={(event) =>
                  onParamsChange({
                    ...params,
                    tmAdvance: event.target.value as
                      "CYCLE_END" | "AMRAP" | "NONE",
                    amrapTmRule:
                      event.target.value === "AMRAP"
                        ? (params.amrapTmRule ?? [
                            { minReps: 0, maxReps: 1, incrementKg: 0 },
                            { minReps: 2, maxReps: 3, incrementKg: 2.5 },
                            { minReps: 4, maxReps: 5, incrementKg: 5 },
                            { minReps: 6, maxReps: null, incrementKg: 7.5 },
                          ])
                        : undefined,
                  })
                }
              >
                <option value="CYCLE_END">At the end of each cycle</option>
                <option value="AMRAP">By AMRAP reps each session</option>
                <option value="NONE">Never (manual)</option>
              </NativeSelect>
            </Field>
          </div>
          {params.tmAdvance === "AMRAP" && params.amrapTmRule && (
            <div className="space-y-2 rounded-lg border p-2">
              <p className="text-muted-foreground text-xs">
                Reps on the AMRAP set → training max increase
              </p>
              {params.amrapTmRule.map((rule, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2"
                >
                  <Field label="From reps">
                    <NumberField
                      aria-label={`Rule ${index + 1} minimum reps`}
                      min={0}
                      max={100}
                      step={1}
                      value={rule.minReps}
                      onCommit={(value) =>
                        onParamsChange({
                          ...params,
                          amrapTmRule: params.amrapTmRule!.map((r, i) =>
                            i === index
                              ? { ...r, minReps: value ?? r.minReps }
                              : r,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="To reps (blank = no limit)">
                    <NumberField
                      aria-label={`Rule ${index + 1} maximum reps`}
                      min={0}
                      max={100}
                      step={1}
                      value={rule.maxReps}
                      onCommit={(value) =>
                        onParamsChange({
                          ...params,
                          amrapTmRule: params.amrapTmRule!.map((r, i) =>
                            i === index ? { ...r, maxReps: value } : r,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="+ kg">
                    <NumberField
                      aria-label={`Rule ${index + 1} increment`}
                      min={0}
                      max={50}
                      step={0.5}
                      value={rule.incrementKg}
                      onCommit={(value) =>
                        onParamsChange({
                          ...params,
                          amrapTmRule: params.amrapTmRule!.map((r, i) =>
                            i === index ? { ...r, incrementKg: value ?? 0 } : r,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove rule ${index + 1}`}
                    onClick={() =>
                      onParamsChange({
                        ...params,
                        amrapTmRule: params.amrapTmRule!.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={params.amrapTmRule.length >= 10}
                onClick={() =>
                  onParamsChange({
                    ...params,
                    amrapTmRule: [
                      ...params.amrapTmRule!,
                      { minReps: 0, maxReps: null, incrementKg: 0 },
                    ],
                  })
                }
              >
                <PlusIcon /> Rule
              </Button>
            </div>
          )}
        </div>
      )}

      {params?.strategy === "RPE" && (
        <div className="space-y-3">
          <Field label="Mode" htmlFor={`${idPrefix}-rpemode`}>
            <NativeSelect
              id={`${idPrefix}-rpemode`}
              value={params.mode}
              onChange={(event) =>
                onParamsChange(
                  defaultParams(
                    "RPE",
                    event.target.value as "TOP_SET_BACKOFF" | "RIR_MESOCYCLE",
                  )!,
                )
              }
            >
              <option value="TOP_SET_BACKOFF">
                Top set at RPE + back-off sets
              </option>
              <option value="RIR_MESOCYCLE">
                RIR mesocycle (effort rises weekly)
              </option>
            </NativeSelect>
          </Field>
          {params.mode === "TOP_SET_BACKOFF" && (
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Back-off (% of top set)"
                htmlFor={`${idPrefix}-backoff`}
              >
                <NumberField
                  id={`${idPrefix}-backoff`}
                  min={50}
                  max={100}
                  step={1}
                  value={params.backoffPercent}
                  onCommit={(value) =>
                    onParamsChange({ ...params, backoffPercent: value ?? 90 })
                  }
                />
              </Field>
              <Field
                label="Back-off sets (if not listed)"
                htmlFor={`${idPrefix}-backoffsets`}
              >
                <NumberField
                  id={`${idPrefix}-backoffsets`}
                  min={0}
                  max={10}
                  step={1}
                  value={params.backoffSets}
                  onCommit={(value) =>
                    onParamsChange({ ...params, backoffSets: value ?? 0 })
                  }
                />
              </Field>
            </div>
          )}
          {params.mode === "RIR_MESOCYCLE" && (
            <div className="grid grid-cols-3 gap-2">
              <Field label="Start RIR" htmlFor={`${idPrefix}-startrir`}>
                <NumberField
                  id={`${idPrefix}-startrir`}
                  min={0}
                  max={5}
                  step={1}
                  value={params.startRir}
                  onCommit={(value) =>
                    onParamsChange({ ...params, startRir: value ?? 3 })
                  }
                />
              </Field>
              <Field label="End RIR" htmlFor={`${idPrefix}-endrir`}>
                <NumberField
                  id={`${idPrefix}-endrir`}
                  min={0}
                  max={5}
                  step={1}
                  value={params.endRir}
                  onCommit={(value) =>
                    onParamsChange({ ...params, endRir: value ?? 0 })
                  }
                />
              </Field>
              <Field label="Sets added / week" htmlFor={`${idPrefix}-addsets`}>
                <NumberField
                  id={`${idPrefix}-addsets`}
                  min={0}
                  max={5}
                  step={1}
                  value={params.addSetsPerWeek}
                  onCommit={(value) =>
                    onParamsChange({ ...params, addSetsPerWeek: value ?? 1 })
                  }
                />
              </Field>
              <Field label="Max sets" htmlFor={`${idPrefix}-maxsets`}>
                <NumberField
                  id={`${idPrefix}-maxsets`}
                  min={1}
                  max={20}
                  step={1}
                  value={params.maxSets}
                  onCommit={(value) =>
                    onParamsChange({ ...params, maxSets: value ?? 5 })
                  }
                />
              </Field>
              <Field label="Increment (kg)" htmlFor={`${idPrefix}-inc`}>
                <NumberField
                  id={`${idPrefix}-inc`}
                  min={0}
                  max={50}
                  step={0.5}
                  value={params.incrementKg}
                  onCommit={(value) =>
                    onParamsChange({ ...params, incrementKg: value ?? 0 })
                  }
                />
              </Field>
            </div>
          )}
        </div>
      )}

      {params?.strategy === "NONE" && (
        <Field label="Loads come from" htmlFor={`${idPrefix}-basis`}>
          <NativeSelect
            id={`${idPrefix}-basis`}
            value={params.basis ?? "FIXED"}
            onChange={(event) =>
              onParamsChange({
                ...params,
                basis: event.target.value as
                  "FIXED" | "WORKING_WEIGHT" | "TRAINING_MAX",
              })
            }
          >
            <option value="FIXED">Fixed kg on each set</option>
            <option value="WORKING_WEIGHT">
              % of the working weight of this key
            </option>
            <option value="TRAINING_MAX">
              % of the training max of this key
            </option>
          </NativeSelect>
        </Field>
      )}
    </div>
  );
}
