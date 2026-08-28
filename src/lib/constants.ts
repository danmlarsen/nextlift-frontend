function requireApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set — define it in .env.local (see .env.local.example). " +
        "Without it every request would be made to `undefined/...`.",
    );
  }
  return url;
}

export const API_URL = requireApiUrl();
export const DEFAULT_LIST_ITEM_AMOUNT = 5;
export const WORKOUT_LIST_ITEM_AMOUNT = 5;
export const EXERCISE_LIST_ITEM_AMOUNT = 20;
export const DATE_LOCALE = "en-US";

export const EQUIPMENT_OPTIONS = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "bodyweight",
  "cardio",
  "smith machine",
  "cable",
  "safety bar",
  "other",
] as const;

export const MUSCLE_GROUP_OPTIONS = [
  "chest",
  "front delts",
  "middle delts",
  "rear delts",
  "biceps",
  "triceps",
  "forearms",
  "traps",
  "lats",
  "upper back",
  "lower back",
  "neck",
  "abs",
  "obliques",
  "glutes",
  "hamstrings",
  "quadriceps",
  "abductors",
  "adductors",
  "calves",
  "olympic",
  "full-body",
  "other",
] as const;

export type TEquipment = (typeof EQUIPMENT_OPTIONS)[number];
export type TMuscleGroup = (typeof MUSCLE_GROUP_OPTIONS)[number];
