"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useEnroll } from "@/api/program-enrollments/mutations";
import {
  type EnrollDto,
  type StartWeightsMode,
} from "@/api/program-enrollments/types";
import { useProgramEnrollDefaults } from "@/api/programs/queries";
import { type EnrollDefaultData, type ProgramData } from "@/api/programs/types";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  PROGRAM_LEVEL_LABELS,
  WEEKDAY_LABELS,
  formatWeekday,
  todayLocalDate,
} from "@/lib/program-format";
import { cn } from "@/lib/utils";
import { enrollSchema } from "@/validation/enrollSchema";

const ROUNDING_OPTIONS = [0.5, 1, 1.25, 2, 2.5, 5];

const FIELD_LABELS = {
  workingWeight: "Working weight",
  trainingMax: "Training max",
  e1rm: "Estimated 1RM",
} as const;

const MODE_OPTIONS: { value: StartWeightsMode; label: string; hint: string }[] =
  [
    {
      value: "HISTORY",
      label: "Use my history",
      hint: "Prefilled from your records and recent workouts. Edit anything.",
    },
    {
      value: "MANUAL",
      label: "Enter manually",
      hint: "Type your own starting numbers.",
    },
    {
      value: "EMPTY",
      label: "Start empty",
      hint: "No suggested loads at first; your first workouts set them.",
    },
  ];

const selectClassName =
  "border-input dark:bg-input/30 h-9 rounded-md border bg-transparent px-2 text-sm";

interface EnrollWizardProps {
  program: ProgramData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EnrollWizard({
  program,
  isOpen,
  onOpenChange,
}: EnrollWizardProps) {
  const router = useRouter();
  const defaults = useProgramEnrollDefaults(program.id, isOpen);
  const enroll = useEnroll();

  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [weekdayMap, setWeekdayMap] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<StartWeightsMode>("HISTORY");
  const [values, setValues] = useState<Record<string, string>>({});
  const [rounding, setRounding] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const days = useMemo(
    () =>
      program.blocks.flatMap((block) =>
        block.days.map((day) => ({ block, day })),
      ),
    [program],
  );
  const loadSlots = useMemo(
    () => (defaults.data?.defaults ?? []).filter((d) => d.field !== null),
    [defaults.data],
  );

  const applyMode = (
    nextMode: StartWeightsMode,
    slots: EnrollDefaultData[],
  ) => {
    setMode(nextMode);
    if (nextMode === "HISTORY") {
      setValues(
        Object.fromEntries(
          slots.map((slot) => [
            slot.progressionKey,
            slot.suggested === null ? "" : String(slot.suggested),
          ]),
        ),
      );
    } else if (nextMode === "EMPTY") {
      setValues({});
    }
  };

  // Prefill once the defaults arrive; reset the wizard whenever it reopens.
  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setFormError(null);
    setStartDate(new Date());
    setWeekdayMap(
      Object.fromEntries(
        days
          .filter(({ day }) => day.weekday !== null)
          .map(({ day }) => [String(day.id), day.weekday as number]),
      ),
    );
  }, [isOpen, days]);

  useEffect(() => {
    if (!isOpen || !defaults.data) return;
    const slots = defaults.data.defaults.filter((d) => d.field !== null);
    setRounding(
      Object.fromEntries(
        slots.map((slot) => [slot.progressionKey, String(slot.roundingKg)]),
      ),
    );
    applyMode("HISTORY", slots);
  }, [isOpen, defaults.data]);

  const weekdayProblem = useMemo(() => {
    if (program.scheduleMode !== "CALENDAR") return null;
    for (const block of program.blocks) {
      const seen = new Set<number>();
      for (const day of block.days) {
        const weekday = weekdayMap[String(day.id)] ?? day.weekday;
        if (weekday === null || weekday === undefined) {
          return `${day.name} needs a weekday`;
        }
        if (seen.has(weekday)) {
          return `Two days share ${formatWeekday(weekday)}`;
        }
        seen.add(weekday);
      }
    }
    return null;
  }, [program, weekdayMap]);

  const problems = defaults.data?.problems ?? [];
  const canContinue = problems.length === 0 && !weekdayProblem;

  const buildDto = (): EnrollDto => ({
    programId: program.id,
    startDate: todayLocalDate(startDate),
    startWeightsMode: mode,
    ...(program.scheduleMode === "CALENDAR" ? { weekdayMap } : {}),
    states: loadSlots.map((slot) => {
      const raw = values[slot.progressionKey];
      const value = raw === undefined || raw.trim() === "" ? null : Number(raw);
      const roundingKg = Number(
        rounding[slot.progressionKey] ?? slot.roundingKg,
      );
      return {
        progressionKey: slot.progressionKey,
        [slot.field as "workingWeight" | "trainingMax" | "e1rm"]: value,
        roundingKg,
      };
    }),
  });

  const handleSubmit = () => {
    setFormError(null);
    const parsed = enrollSchema.safeParse(buildDto());
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check your numbers");
      return;
    }
    enroll.mutate(parsed.data, {
      onSuccess: () => {
        toast.success(`You are now following ${program.name}`);
        onOpenChange(false);
        router.push("/app/programs/active");
      },
      onError: (error) => {
        setFormError(error.message || "Could not start the program");
      },
    });
  };

  const steps = ["Schedule", "Starting loads", "Review"];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Follow ${program.name}`}
      description="Choose a start date and starting weights"
      content={
        <div className="grid h-full grid-rows-[auto_1fr_auto] gap-4 p-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Follow this program</h2>
            <p className="text-muted-foreground text-sm">
              Step {step + 1} of {steps.length} · {steps[step]}
            </p>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto">
            {defaults.isLoading && <Skeleton className="h-40 rounded-xl" />}
            {defaults.isError && (
              <p className="text-destructive text-sm">
                Could not load the program details. Please try again.
              </p>
            )}
            {problems.length > 0 && (
              <div className="text-destructive space-y-1 text-sm">
                <p>This program cannot be followed yet:</p>
                <ul className="list-inside list-disc">
                  {problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              </div>
            )}

            {step === 0 && defaults.isSuccess && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="enroll-start-date">Start date</Label>
                  <DatePicker defaultDate={startDate} onChange={setStartDate} />
                  <p className="text-muted-foreground text-xs">
                    {program.scheduleMode === "CALENDAR"
                      ? "Week 1 is the week containing this date (weeks start on Monday)."
                      : "Days follow one another in order, whenever you train."}
                  </p>
                </div>
                {program.scheduleMode === "CALENDAR" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Training days</p>
                    <ul className="space-y-2">
                      {days.map(({ block, day }) => (
                        <li
                          key={day.id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="truncate">
                            {program.blocks.length > 1
                              ? `${block.name} · `
                              : ""}
                            {day.name}
                          </span>
                          <select
                            className={selectClassName}
                            aria-label={`Weekday for ${day.name}`}
                            value={
                              weekdayMap[String(day.id)] ?? day.weekday ?? ""
                            }
                            onChange={(event) =>
                              setWeekdayMap({
                                ...weekdayMap,
                                [String(day.id)]: Number(event.target.value),
                              })
                            }
                          >
                            {WEEKDAY_LABELS.map((label, index) => (
                              <option key={label} value={index + 1}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </li>
                      ))}
                    </ul>
                    {weekdayProblem && (
                      <p className="text-destructive text-xs">
                        {weekdayProblem}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 1 && defaults.isSuccess && (
              <div className="space-y-4">
                <RadioGroup
                  value={mode}
                  onValueChange={(value) =>
                    applyMode(value as StartWeightsMode, loadSlots)
                  }
                >
                  {MODE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3",
                        mode === option.value && "border-accent",
                      )}
                    >
                      <RadioGroupItem value={option.value} className="mt-0.5" />
                      <span className="space-y-0.5">
                        <span className="block text-sm font-medium">
                          {option.label}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          {option.hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>

                {loadSlots.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    This program needs no starting loads.
                  </p>
                )}
                {loadSlots.length > 0 && (
                  <ul className="space-y-3">
                    {loadSlots.map((slot) => (
                      <li key={slot.progressionKey} className="space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <Label
                            htmlFor={`enroll-${slot.progressionKey}`}
                            className="truncate"
                          >
                            {slot.exerciseName}
                          </Label>
                          <span className="text-muted-foreground shrink-0 text-xs">
                            {FIELD_LABELS[slot.field!]} (kg)
                          </span>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                          <Input
                            id={`enroll-${slot.progressionKey}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={0.5}
                            placeholder={mode === "EMPTY" ? "—" : "kg"}
                            disabled={mode === "EMPTY"}
                            value={values[slot.progressionKey] ?? ""}
                            onChange={(event) =>
                              setValues({
                                ...values,
                                [slot.progressionKey]: event.target.value,
                              })
                            }
                          />
                          <select
                            className={selectClassName}
                            aria-label={`Rounding for ${slot.exerciseName}`}
                            value={
                              rounding[slot.progressionKey] ??
                              String(slot.roundingKg)
                            }
                            onChange={(event) =>
                              setRounding({
                                ...rounding,
                                [slot.progressionKey]: event.target.value,
                              })
                            }
                          >
                            {ROUNDING_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                ±{option} kg
                              </option>
                            ))}
                          </select>
                        </div>
                        {mode === "HISTORY" && slot.source && (
                          <p className="text-muted-foreground text-xs">
                            {slot.source === "PR_1RM"
                              ? "From your estimated 1RM record"
                              : "From your last workout"}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {step === 2 && defaults.isSuccess && (
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">{program.name}</span> ·{" "}
                  {PROGRAM_LEVEL_LABELS[program.level]} · {program.daysPerWeek}{" "}
                  days/week
                </p>
                <p>
                  Starts {todayLocalDate(startDate)} ·{" "}
                  {MODE_OPTIONS.find((option) => option.value === mode)?.label}
                </p>
                {loadSlots.length > 0 && (
                  <ul className="divide-border/60 divide-y">
                    {loadSlots.map((slot) => (
                      <li
                        key={slot.progressionKey}
                        className="flex justify-between gap-2 py-1.5"
                      >
                        <span className="truncate">{slot.exerciseName}</span>
                        <span className="text-muted-foreground shrink-0">
                          {values[slot.progressionKey]?.trim()
                            ? `${values[slot.progressionKey]} kg`
                            : "set during the first week"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {formError && <p className="text-destructive">{formError}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                step === 0 ? onOpenChange(false) : setStep(step - 1)
              }
              disabled={enroll.isPending}
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!defaults.isSuccess || !canContinue}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={enroll.isPending || !canContinue}
              >
                {enroll.isPending && <Spinner />}
                Start program
              </Button>
            )}
          </div>
        </div>
      }
    />
  );
}
