"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import { toast } from "sonner";

import {
  useCreateProgram,
  useCreateProgramDay,
  useImportTemplateIntoDay,
  useUpdateProgramBlock,
  useUpdateProgramWeek,
} from "@/api/programs/mutations";
import { PROGRAM_GOALS, PROGRAM_LEVELS } from "@/api/programs/types";
import { useWorkoutTemplates } from "@/api/workout-templates/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  PROGRAM_GOAL_LABELS,
  PROGRAM_LEVEL_LABELS,
  WEEKDAY_LABELS,
} from "@/lib/program-format";
import { programMetaSchema } from "@/validation/programSchema";
import {
  buildWizardPlan,
  defaultDays,
  type WizardInput,
} from "../../editor/wizard-plan";
import { Field, NativeSelect } from "./inputs";

const STEPS = ["Basics", "Schedule", "Days"];

const LEVEL_HINTS: Record<WizardInput["level"], string> = {
  BEGINNER:
    "New exercises start with linear progression: add weight every session.",
  NOVICE: "Linear progression by default; double progression for accessories.",
  INTERMEDIATE:
    "Double progression by default; percent-of-max waves are a good fit.",
  ADVANCED: "RPE-based defaults: top sets at a target effort with back-offs.",
  ELITE: "RPE-based defaults; percent-based peaking blocks are available.",
};

export default function ProgramWizard() {
  const router = useRouter();
  const templates = useWorkoutTemplates();
  const createProgram = useCreateProgram();
  const updateBlock = useUpdateProgramBlock();
  const updateWeek = useUpdateProgramWeek();
  const createDay = useCreateProgramDay();
  const importTemplate = useImportTemplateIntoDay();

  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState<WizardInput>({
    name: "",
    description: "",
    goal: "STRENGTH",
    level: "NOVICE",
    daysPerWeek: 3,
    scheduleMode: "SEQUENCE",
    durationMode: "OPEN_ENDED",
    effortScale: "RPE",
    weeks: 1,
    deloadLastWeek: false,
    days: defaultDays(3, "SEQUENCE"),
  });

  const update = (patch: Partial<WizardInput>) => {
    setInput((current) => {
      const next = { ...current, ...patch };
      if (patch.daysPerWeek !== undefined || patch.scheduleMode !== undefined) {
        next.days = defaultDays(
          next.daysPerWeek,
          next.scheduleMode,
          current.days,
        );
      }
      if (
        patch.durationMode === "OPEN_ENDED" &&
        current.durationMode === "FIXED"
      ) {
        next.weeks = Math.min(current.weeks, 4);
      }
      if (
        patch.durationMode === "FIXED" &&
        current.durationMode === "OPEN_ENDED"
      ) {
        next.weeks = Math.max(current.weeks, 4);
      }
      return next;
    });
  };

  const basicsValid = programMetaSchema
    .pick({ name: true, goal: true, level: true })
    .safeParse({
      name: input.name.trim(),
      goal: input.goal,
      level: input.level,
    }).success;

  const weekdayProblem =
    input.scheduleMode === "CALENDAR" &&
    new Set(input.days.map((day) => day.weekday)).size !== input.days.length
      ? "Each training day needs its own weekday"
      : null;

  const handleCreate = async () => {
    setError(null);
    setCreating(true);
    const plan = buildWizardPlan(input);
    try {
      const program = await createProgram.mutateAsync(plan.program);
      const blockId = program.blocks[0].id;
      await updateBlock.mutateAsync({
        programId: program.id,
        blockId,
        data: { name: plan.block.name, weeks: plan.block.weeks },
      });
      if (plan.deloadWeek) {
        await updateWeek.mutateAsync({
          programId: program.id,
          blockId,
          weekInBlock: plan.deloadWeek,
          data: {
            label: "Deload",
            isDeload: true,
            volumeMultiplier: 0.5,
            intensityMultiplier: 0.6,
          },
        });
      }
      for (const day of plan.days) {
        const updated = await createDay.mutateAsync({
          programId: program.id,
          blockId,
          data: { name: day.name, weekday: day.weekday },
        });
        if (day.templateId) {
          const created =
            updated.blocks[0].days[updated.blocks[0].days.length - 1];
          await importTemplate.mutateAsync({
            programId: program.id,
            dayId: created.id,
            templateId: day.templateId,
          });
        }
      }
      toast.success("Program created — now add exercises to each day");
      router.push(`/app/programs/${program.id}/edit`);
    } catch (caught) {
      setCreating(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not create the program",
      );
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex min-h-12 items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => router.back()} aria-label="Back">
          <ChevronLeftIcon />
        </Button>
        <h1 className="text-xl font-bold">New program</h1>
        <div className="w-14" aria-hidden="true" />
      </div>
      <p className="text-muted-foreground text-sm">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Name" htmlFor="wizard-name">
              <Input
                id="wizard-name"
                value={input.name}
                maxLength={60}
                placeholder="e.g. My upper / lower split"
                onChange={(event) => update({ name: event.target.value })}
              />
            </Field>
            <Field label="Description" htmlFor="wizard-description">
              <Textarea
                id="wizard-description"
                value={input.description}
                maxLength={1000}
                rows={3}
                placeholder="What is this program for?"
                onChange={(event) =>
                  update({ description: event.target.value })
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Goal" htmlFor="wizard-goal">
                <NativeSelect
                  id="wizard-goal"
                  value={input.goal}
                  onChange={(event) =>
                    update({ goal: event.target.value as WizardInput["goal"] })
                  }
                >
                  {PROGRAM_GOALS.map((goal) => (
                    <option key={goal} value={goal}>
                      {PROGRAM_GOAL_LABELS[goal]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field
                label="Level"
                htmlFor="wizard-level"
                hint={LEVEL_HINTS[input.level]}
              >
                <NativeSelect
                  id="wizard-level"
                  value={input.level}
                  onChange={(event) =>
                    update({
                      level: event.target.value as WizardInput["level"],
                    })
                  }
                >
                  {PROGRAM_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {PROGRAM_LEVEL_LABELS[level]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Days per week" htmlFor="wizard-days">
                <NativeSelect
                  id="wizard-days"
                  value={input.daysPerWeek}
                  onChange={(event) =>
                    update({ daysPerWeek: Number(event.target.value) })
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                    <option key={days} value={days}>
                      {days}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field
                label="Schedule"
                htmlFor="wizard-schedule"
                hint={
                  input.scheduleMode === "CALENDAR"
                    ? "Days are pinned to weekdays."
                    : "Days follow one another whenever you train."
                }
              >
                <NativeSelect
                  id="wizard-schedule"
                  value={input.scheduleMode}
                  onChange={(event) =>
                    update({
                      scheduleMode: event.target
                        .value as WizardInput["scheduleMode"],
                    })
                  }
                >
                  <option value="SEQUENCE">Rotation</option>
                  <option value="CALENDAR">Fixed weekdays</option>
                </NativeSelect>
              </Field>
              <Field label="Length" htmlFor="wizard-duration">
                <NativeSelect
                  id="wizard-duration"
                  value={input.durationMode}
                  onChange={(event) =>
                    update({
                      durationMode: event.target
                        .value as WizardInput["durationMode"],
                    })
                  }
                >
                  <option value="OPEN_ENDED">Repeats until I stop</option>
                  <option value="FIXED">Fixed number of weeks</option>
                </NativeSelect>
              </Field>
              <Field
                label={
                  input.durationMode === "FIXED" ? "Weeks" : "Weeks per cycle"
                }
                htmlFor="wizard-weeks"
              >
                <Input
                  id="wizard-weeks"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={52}
                  value={input.weeks}
                  onChange={(event) =>
                    update({ weeks: Number(event.target.value) || 1 })
                  }
                />
              </Field>
              <Field label="Effort shown as" htmlFor="wizard-effort">
                <NativeSelect
                  id="wizard-effort"
                  value={input.effortScale}
                  onChange={(event) =>
                    update({
                      effortScale: event.target
                        .value as WizardInput["effortScale"],
                    })
                  }
                >
                  <option value="RPE">RPE (6–10)</option>
                  <option value="RIR">RIR (reps in reserve)</option>
                </NativeSelect>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={input.deloadLastWeek}
                disabled={input.weeks < 2}
                onCheckedChange={(checked) =>
                  update({ deloadLastWeek: !!checked })
                }
              />
              Make the last week a deload (half the sets at 60 % load)
            </label>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Days</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Name each day and optionally start it from a template. Exercises
              and progression rules are edited next.
            </p>
            <ul className="space-y-3">
              {input.days.map((day, index) => (
                <li
                  key={index}
                  className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_auto_1fr]"
                >
                  <Input
                    aria-label={`Day ${index + 1} name`}
                    value={day.name}
                    maxLength={50}
                    onChange={(event) =>
                      update({
                        days: input.days.map((candidate, i) =>
                          i === index
                            ? { ...candidate, name: event.target.value }
                            : candidate,
                        ),
                      })
                    }
                  />
                  {input.scheduleMode === "CALENDAR" ? (
                    <NativeSelect
                      aria-label={`Day ${index + 1} weekday`}
                      className="w-24"
                      value={day.weekday ?? ""}
                      onChange={(event) =>
                        update({
                          days: input.days.map((candidate, i) =>
                            i === index
                              ? {
                                  ...candidate,
                                  weekday: Number(event.target.value),
                                }
                              : candidate,
                          ),
                        })
                      }
                    >
                      {WEEKDAY_LABELS.map((label, weekday) => (
                        <option key={label} value={weekday + 1}>
                          {label}
                        </option>
                      ))}
                    </NativeSelect>
                  ) : (
                    <span className="text-muted-foreground self-center text-xs">
                      #{index + 1}
                    </span>
                  )}
                  <NativeSelect
                    aria-label={`Day ${index + 1} template`}
                    className="col-span-2 sm:col-span-1"
                    value={day.templateId ?? ""}
                    onChange={(event) =>
                      update({
                        days: input.days.map((candidate, i) =>
                          i === index
                            ? {
                                ...candidate,
                                templateId:
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                              }
                            : candidate,
                        ),
                      })
                    }
                  >
                    <option value="">Start empty</option>
                    {templates.data?.map((template) => (
                      <option key={template.id} value={template.id}>
                        From template: {template.name}
                      </option>
                    ))}
                  </NativeSelect>
                </li>
              ))}
            </ul>
            {weekdayProblem && (
              <p className="text-destructive text-xs">{weekdayProblem}</p>
            )}
            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          disabled={creating}
          onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={(step === 0 && !basicsValid) || creating}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={creating || !!weekdayProblem}
          >
            {creating && <Spinner />}
            Create program
          </Button>
        )}
      </div>
    </div>
  );
}
