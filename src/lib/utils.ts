import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  WorkoutSummaryData,
  type WorkoutData,
  type WorkoutExerciseBestSet,
  type WorkoutSetData,
} from "@/api/workouts/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  value: number,
  options?: {
    compact?: boolean;
    maximumFractionDigits?: number;
  },
): string {
  const { compact = false, maximumFractionDigits = 1 } = options || {};

  if (compact) {
    // Use compact notation for large numbers (1M, 1.2K, etc.)
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits,
    }).format(value);
  }

  // Use standard formatting with commas and respect maximumFractionDigits
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  return formatNumber(value, { compact: true });
}

export function formatWeight(value: number): string {
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
}

export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  // Epley formula
  return weight * (1 + reps / 30);
}

export function getBestSetByOneRM(
  sets: WorkoutSetData[],
): WorkoutSetData | null {
  if (sets.length === 0) return null;

  return sets.reduce((best, current) => {
    const currentOneRM = calculateOneRepMax(current.weight!, current.reps!);
    const bestOneRM = calculateOneRepMax(best.weight!, best.reps!);

    return currentOneRM > bestOneRM ? current : best;
  });
}

export function getBestSetByDuration(
  sets: WorkoutSetData[],
): WorkoutSetData | null {
  if (sets.length === 0) return null;

  return sets.reduce((best, current) =>
    current.duration! > best.duration! ? current : best,
  );
}

export function formatBestSet(bestSet: WorkoutExerciseBestSet | null): string {
  if (bestSet?.reps && bestSet.weight) {
    return bestSet ? `${bestSet.weight} kg x ${bestSet.reps}` : "-";
  }

  if (bestSet?.duration) {
    return `${bestSet.duration} min`;
  }

  return "";
}

export function isValidCompletedSet(set: WorkoutSetData | undefined): boolean {
  return (
    !!set &&
    !!set.completed &&
    ((typeof set.weight === "number" &&
      typeof set.reps === "number" &&
      set.weight > 0 &&
      set.reps > 0) ||
      (typeof set.duration === "number" && set.duration > 0))
  );
}

/**
 * The comparable "load" of a set: weight for strength sets, duration for
 * cardio sets. Used to decide whether a set done this session is heavier or
 * lighter than what the previous workout did in the same slot.
 */
function getSetLoad(set: WorkoutSetData): number | null {
  if (typeof set.weight === "number" && set.weight > 0) {
    return set.weight;
  }
  if (typeof set.duration === "number" && set.duration > 0) {
    return set.duration;
  }
  return null;
}

function hasSameLoad(a: WorkoutSetData, b: WorkoutSetData): boolean {
  if (typeof a.weight === "number" && a.weight > 0) {
    return a.weight === b.weight && a.reps === b.reps;
  }
  if (typeof a.duration === "number" && a.duration > 0) {
    return a.duration === b.duration;
  }
  return false;
}

/**
 * Picks the set whose values should be suggested for `setIndex` before any
 * template suggestion or already-persisted value is layered on top.
 *
 * The previous workout's set in the same slot is the primary guess. A set
 * completed earlier this session only carries forward when it is at or above
 * that slot's historical load, so a light warmup never becomes the
 * placeholder for the work sets that follow it. Without history for the slot
 * the previous set in the session is suggested, as before.
 */
export function resolveDerivedWorkoutSet(
  setIndex: number,
  previousWorkoutSets: WorkoutSetData[] | undefined,
  currentWorkoutSets?: WorkoutSetData[],
): WorkoutSetData | undefined {
  const currentSet = currentWorkoutSets?.[setIndex];
  const prevAtIndex = previousWorkoutSets?.[setIndex];
  const prevLast = previousWorkoutSets?.[previousWorkoutSets.length - 1];

  const completedBefore = (currentWorkoutSets ?? [])
    .slice(0, setIndex)
    .map((set, index) => ({ set, index }))
    .filter(({ set }) => isValidCompletedSet(set));
  const lastCompleted = completedBefore[completedBefore.length - 1];
  const carry = completedBefore
    .filter(({ set }) => set.type !== "warmup")
    .at(-1);

  // No history for this slot: suggest the previous set in the session.
  if (!prevAtIndex) {
    return carry?.set ?? lastCompleted?.set ?? prevLast;
  }

  // Only warmups so far, or this set is itself a warmup: history wins.
  if (!carry || currentSet?.type === "warmup") {
    return prevAtIndex;
  }

  // The carried set replays last workout's set in the same slot, so the
  // lifter is following that pattern (ramp-up, pyramid, straight sets).
  const counterpart = previousWorkoutSets?.[carry.index];
  if (counterpart && hasSameLoad(carry.set, counterpart)) {
    return prevAtIndex;
  }

  // At or above the historical load: keep the momentum of this session.
  // Below it: treat the lighter set as ramp-up and suggest history.
  const carryLoad = getSetLoad(carry.set);
  const prevLoad = getSetLoad(prevAtIndex);
  if (carryLoad === null || prevLoad === null || carryLoad >= prevLoad) {
    return carry.set;
  }
  return prevAtIndex;
}

export function getPlaceholderWorkoutSet(
  setIndex: number,
  previousWorkoutSets: WorkoutSetData[] | undefined,
  currentWorkoutSets?: WorkoutSetData[],
): WorkoutSetData | undefined {
  const derivedSet = resolveDerivedWorkoutSet(
    setIndex,
    previousWorkoutSets,
    currentWorkoutSets,
  );

  const currentSet = currentWorkoutSets?.[setIndex];

  // A set carrying its own template suggestions outranks the derived
  // placeholder per field: a template's work-set target must not be shadowed
  // by the just-completed warmup. Missing fields still fall back.
  const placeholderSet =
    currentSet &&
    (currentSet.suggestedWeight != null ||
      currentSet.suggestedReps != null ||
      currentSet.suggestedDuration != null)
      ? {
          ...(derivedSet ?? currentSet),
          weight: currentSet.suggestedWeight ?? derivedSet?.weight ?? null,
          reps: currentSet.suggestedReps ?? derivedSet?.reps ?? null,
          duration:
            currentSet.suggestedDuration ?? derivedSet?.duration ?? null,
        }
      : derivedSet;

  if (currentSet?.completed) {
    return placeholderSet
      ? {
          ...currentSet,
          weight: currentSet.weight ?? placeholderSet.weight,
          reps: currentSet.reps ?? placeholderSet.reps,
          duration: currentSet.duration ?? placeholderSet.duration,
        }
      : currentSet;
  }

  return placeholderSet;
}

export function parseWorkoutTitle(
  workout: Pick<WorkoutData, "title" | "startedAt">,
) {
  return workout.title
    ? workout.title
    : new Date(workout.startedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) + " Workout";
}

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours ? `${hours.toString().padStart(2, "0")}:` : ""}${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const formatTimeFromMs = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours ? `${hours.toString().padStart(2, "0")}:` : ""}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export function getDayRangeUTC(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0); // local start of day

  const end = new Date(date);
  end.setHours(23, 59, 59, 999); // local end of day

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

/**
 * Generates YouTube embed URL with Short-optimized parameters
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options?: {
    autoplay?: boolean;
    start?: number;
    mute?: boolean;
    loop?: boolean;
  },
): string {
  const params = new URLSearchParams();

  if (options?.autoplay) params.set("autoplay", "1");
  if (options?.start) params.set("start", options.start.toString());
  if (options?.mute) params.set("mute", "1");
  if (options?.loop) {
    params.set("loop", "1");
    params.set("playlist", videoId); // Required for looping
  }

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ""}`;
}

/**
 * Generates YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: "default" | "medium" | "high" | "maxres" = "medium",
): string {
  const qualityMap = {
    default: "default", // 120x90
    medium: "mqdefault", // 320x180
    high: "hqdefault", // 480x360
    maxres: "maxresdefault", // 1280x720 (if available)
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export function summarizeWorkout(workout: WorkoutData) {
  const totalWeight = workout.workoutExercises.reduce(
    (total, exercise) =>
      total +
      exercise.workoutSets.reduce(
        (setTotal, curSet) =>
          setTotal +
          (curSet.completed ? (curSet.weight ?? 0) * (curSet.reps ?? 0) : 0),
        0,
      ),
    0,
  );

  const totalCompletedSets = workout.workoutExercises.reduce(
    (total, exercise) =>
      total + exercise.workoutSets?.filter((set) => !!set.completed)?.length,
    0,
  );

  const compressedWorkoutExercises = workout.workoutExercises.map(
    (workoutExercise) => {
      const completedSets = workoutExercise.workoutSets.reduce(
        (sum, set) => (set.completed ? sum + 1 : sum),
        0,
      );

      // An exercise can have zero sets (last set removed mid-workout); the
      // helpers return null instead of throwing on an empty reduce.
      let bestSet: WorkoutSetData | null = null;
      if (workoutExercise.exercise.category === "strength") {
        bestSet = getBestSetByOneRM(workoutExercise.workoutSets);
      }
      if (workoutExercise.exercise.category === "cardio") {
        bestSet = getBestSetByDuration(workoutExercise.workoutSets);
      }

      return {
        exerciseName: workoutExercise.exercise.name,
        sets: completedSets,
        bestSet,
      };
    },
  );

  return {
    ...workout,
    totalWeight,
    totalCompletedSets,
    workoutExercises: compressedWorkoutExercises.filter((we) => we.sets > 0),
  } as WorkoutSummaryData;
}
