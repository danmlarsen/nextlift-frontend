import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
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

export function getPlaceholderWorkoutSet(
  setIndex: number,
  previousWorkoutSets: WorkoutSetData[] | undefined,
  currentWorkoutSets?: WorkoutSetData[],
): WorkoutSetData | undefined {
  // Find the most recent valid completed set in current or previous workout
  const completedSets = currentWorkoutSets?.filter(isValidCompletedSet) ?? [];
  const placeholderSet =
    completedSets.length > 0
      ? completedSets[completedSets.length - 1]
      : (previousWorkoutSets?.[setIndex] ??
        previousWorkoutSets?.[previousWorkoutSets.length - 1]);

  const currentSet = currentWorkoutSets?.[setIndex];
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
