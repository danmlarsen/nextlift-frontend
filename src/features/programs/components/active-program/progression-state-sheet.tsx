"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  useSwapEnrollmentExercise,
  useUpdateEnrollmentState,
} from "@/api/program-enrollments/mutations";
import {
  type EnrollmentData,
  type EnrollmentStateData,
} from "@/api/program-enrollments/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Spinner } from "@/components/ui/spinner";
import ExercisesView from "@/features/exercises/components/exercises-view/exercises-view";
import { useSearchParamState } from "@/hooks/use-search-param-state";

const ROUNDING_OPTIONS = [0.5, 1, 1.25, 2, 2.5, 5];

type NumericField = "workingWeight" | "trainingMax" | "e1rm";
const FIELDS: { key: NumericField; label: string }[] = [
  { key: "workingWeight", label: "Working weight" },
  { key: "trainingMax", label: "Training max" },
  { key: "e1rm", label: "Est. 1RM" },
];

function StateRow({
  enrollmentId,
  state,
  onSwap,
}: {
  enrollmentId: number;
  state: EnrollmentStateData;
  onSwap: (state: EnrollmentStateData) => void;
}) {
  const updateState = useUpdateEnrollmentState();
  const [values, setValues] = useState<Record<NumericField, string>>({
    workingWeight: state.workingWeight?.toString() ?? "",
    trainingMax: state.trainingMax?.toString() ?? "",
    e1rm: state.e1rm?.toString() ?? "",
  });
  const [roundingKg, setRoundingKg] = useState(
    state.roundingKg?.toString() ?? "",
  );

  const dirty =
    FIELDS.some(({ key }) => values[key] !== (state[key]?.toString() ?? "")) ||
    roundingKg !== (state.roundingKg?.toString() ?? "");

  const handleSave = () => {
    const parse = (value: string) =>
      value.trim() === "" ? null : Number(value);
    updateState.mutate(
      {
        enrollmentId,
        progressionKey: state.progressionKey,
        data: {
          workingWeight: parse(values.workingWeight),
          trainingMax: parse(values.trainingMax),
          e1rm: parse(values.e1rm),
          roundingKg: parse(roundingKg),
        },
      },
      {
        onSuccess: () =>
          toast.success(`${state.exercise?.name ?? "Slot"} updated`),
        onError: (error) => toast.error(error.message || "Could not save"),
      },
    );
  };

  return (
    <li className="space-y-3 rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {state.exercise?.name ?? `Exercise #${state.exerciseId}`}
          </p>
          <p className="text-muted-foreground text-xs">
            {state.progressionKey}
            {state.stageIndex > 0 ? ` · stage ${state.stageIndex + 1}` : ""}
            {state.consecutiveFails > 0
              ? ` · ${state.consecutiveFails} missed`
              : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onSwap(state)}>
          Swap
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={`state-${state.id}-${key}`} className="text-xs">
              {label}
            </Label>
            <Input
              id={`state-${state.id}-${key}`}
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              placeholder="kg"
              value={values[key]}
              onChange={(event) =>
                setValues({ ...values, [key]: event.target.value })
              }
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <label className="text-muted-foreground flex items-center gap-2 text-xs">
          Round to
          <select
            className="border-input dark:bg-input/30 h-8 rounded-md border bg-transparent px-2 text-sm"
            aria-label={`Rounding for ${state.exercise?.name ?? state.progressionKey}`}
            value={roundingKg}
            onChange={(event) => setRoundingKg(event.target.value)}
          >
            <option value="">Program default</option>
            {ROUNDING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} kg
              </option>
            ))}
          </select>
        </label>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || updateState.isPending}
        >
          {updateState.isPending && <Spinner />}
          Save
        </Button>
      </div>
    </li>
  );
}

interface ProgressionStateSheetProps {
  enrollment: EnrollmentData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Manual control over every progression slot: numbers, rounding and swaps. */
export default function ProgressionStateSheet({
  enrollment,
  isOpen,
  onOpenChange,
}: ProgressionStateSheetProps) {
  const [swapOpen, setSwapOpen] = useSearchParamState(
    "program-swap-exercise-modal",
  );
  const [swapping, setSwapping] = useState<EnrollmentStateData | null>(null);
  const swapExercise = useSwapEnrollmentExercise();

  const handleSwapPick = (exerciseId: number) => {
    if (!swapping) return;
    swapExercise.mutate(
      {
        enrollmentId: enrollment.id,
        data: { fromExerciseId: swapping.exerciseId, toExerciseId: exerciseId },
      },
      {
        onSuccess: () => {
          toast.success("Exercise swapped for the rest of the program");
          setSwapOpen(false);
          setSwapping(null);
        },
        onError: (error) => toast.error(error.message || "Could not swap"),
      },
    );
  };

  return (
    <>
      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Adjust weights and exercises"
        description="Edit progression numbers or swap exercises"
        content={
          <div className="space-y-4 p-4">
            <div>
              <h2 className="text-xl font-bold">Weights & exercises</h2>
              <p className="text-muted-foreground text-sm">
                Each slot keeps its own numbers. Swapping an exercise keeps the
                numbers and applies to the rest of the program.
              </p>
            </div>
            <ul className="space-y-3">
              {enrollment.states.map((state) => (
                <StateRow
                  key={state.id}
                  enrollmentId={enrollment.id}
                  state={state}
                  onSwap={(target) => {
                    setSwapping(target);
                    setSwapOpen(true);
                  }}
                />
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        }
      />

      <ResponsiveModal
        isOpen={swapOpen && !!swapping}
        onOpenChange={setSwapOpen}
        title="Swap exercise"
        description={`Pick a replacement for ${swapping?.exercise?.name ?? "this exercise"}`}
        content={
          <div className="space-y-4 p-4">
            <h2 className="text-xl font-bold">
              Replace {swapping?.exercise?.name ?? "exercise"}
            </h2>
            {swapExercise.isPending && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}
            <ExercisesView onExerciseClick={handleSwapPick} />
          </div>
        }
      />
    </>
  );
}
