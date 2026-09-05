import {
  type WorkoutData,
  type WorkoutExerciseData,
  type WorkoutSetData,
} from "@/api/workouts/types";
import { type ExerciseData } from "@/api/exercises/types";
import {
  calculateOneRepMax,
  formatCompactNumber,
  formatNumber,
  getPlaceholderWorkoutSet,
  parseWorkoutTitle,
  summarizeWorkout,
} from "./utils";

describe("utilts", () => {
  describe("formatNumber()", () => {
    it("should be defined", () => {
      expect(formatNumber).toBeDefined();
    });

    it("should format number correctly", () => {
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(1234567, { compact: true })).toBe("1.2M");
      expect(formatNumber(1234.567, { maximumFractionDigits: 2 })).toBe(
        "1,234.57",
      );
      expect(
        formatNumber(1234567, { compact: true, maximumFractionDigits: 0 }),
      ).toBe("1M");
    });
  });

  describe("formatCompactNumber()", () => {
    it("should format compact number correctly", () => {
      expect(formatCompactNumber(1234567)).toBe("1.2M");
    });
  });

  describe("calculateOneRepMax()", () => {
    it("should calculate 1RM correctly", () => {
      expect(calculateOneRepMax(10, 1)).toBe(10);
      expect(calculateOneRepMax(100, 3)).toBeCloseTo(110);
    });
  });

  describe("parseWorkoutTitle()", () => {
    let workout: { title: string | undefined; startedAt: string };
    beforeEach(() => {
      workout = {
        title: undefined,
        startedAt: new Date().toISOString(),
      };
    });

    it("should return a date if no title is provided", () => {
      const titleWithDateRegEx = /[A-Za-z]{3} \d{1,2} Workout/;

      expect(parseWorkoutTitle(workout)).toMatch(titleWithDateRegEx);
    });

    it("should return title if title is provided", () => {
      workout.title = "Title";

      expect(parseWorkoutTitle(workout)).toBe(workout.title);
    });
  });

  describe("getPlaceholderWorkoutSet()", () => {
    let nextId = 1;
    const makeSet = (overrides: Partial<WorkoutSetData>): WorkoutSetData => ({
      id: nextId++,
      workoutExerciseId: 1,
      createdAt: "",
      updatedAt: "",
      completed: false,
      reps: null,
      weight: null,
      duration: null,
      setNumber: 1,
      notes: null,
      type: "normal",
      suggestedReps: null,
      suggestedWeight: null,
      suggestedDuration: null,
      ...overrides,
    });

    it("falls back to the previous workout's set at the same index", () => {
      const previous = [makeSet({ weight: 80, reps: 8 })];
      const current = [makeSet({})];

      const placeholder = getPlaceholderWorkoutSet(0, previous, current);

      expect(placeholder?.weight).toBe(80);
      expect(placeholder?.reps).toBe(8);
    });

    it("prefers the set's own template suggestions over the previous set", () => {
      const previous = [makeSet({ weight: 80, reps: 8 })];
      const current = [makeSet({ suggestedWeight: 100, suggestedReps: 5 })];

      const placeholder = getPlaceholderWorkoutSet(0, previous, current);

      expect(placeholder?.weight).toBe(100);
      expect(placeholder?.reps).toBe(5);
    });

    it("prefers the set's own template suggestions over the last completed set", () => {
      const current = [
        makeSet({
          completed: true,
          type: "warmup",
          weight: 60,
          reps: 10,
        }),
        makeSet({ setNumber: 2, suggestedWeight: 100, suggestedReps: 5 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, undefined, current);

      expect(placeholder?.weight).toBe(100);
      expect(placeholder?.reps).toBe(5);
    });

    it("falls back per field when a suggestion is missing", () => {
      const previous = [makeSet({ weight: 80, reps: 8 })];
      const current = [makeSet({ suggestedReps: 5 })];

      const placeholder = getPlaceholderWorkoutSet(0, previous, current);

      expect(placeholder?.reps).toBe(5);
      expect(placeholder?.weight).toBe(80);
    });

    it("keeps the derived placeholder for sets without suggestions", () => {
      const current = [
        makeSet({ completed: true, weight: 60, reps: 10 }),
        makeSet({ setNumber: 2 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, undefined, current);

      expect(placeholder?.weight).toBe(60);
      expect(placeholder?.reps).toBe(10);
    });

    it("suggests last workout's set for the slot after a light untyped warmup", () => {
      const previous = [
        makeSet({ weight: 60, reps: 10 }),
        makeSet({ setNumber: 2, weight: 80, reps: 8 }),
        makeSet({ setNumber: 3, weight: 80, reps: 8 }),
      ];
      const current = [
        makeSet({ completed: true, weight: 20, reps: 10 }),
        makeSet({ setNumber: 2 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, previous, current);

      expect(placeholder?.weight).toBe(80);
      expect(placeholder?.reps).toBe(8);
    });

    it("suggests the previous set in the session when there is no history", () => {
      const current = [
        makeSet({ completed: true, weight: 20, reps: 10 }),
        makeSet({ setNumber: 2 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, undefined, current);

      expect(placeholder?.weight).toBe(20);
      expect(placeholder?.reps).toBe(10);
    });

    it("never carries a typed warmup forward when history exists", () => {
      const previous = [
        makeSet({ weight: 80, reps: 8 }),
        makeSet({ setNumber: 2, weight: 80, reps: 8 }),
      ];
      const current = [
        makeSet({ completed: true, type: "warmup", weight: 60, reps: 10 }),
        makeSet({ setNumber: 2 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, previous, current);

      expect(placeholder?.weight).toBe(80);
      expect(placeholder?.reps).toBe(8);
    });

    it("carries a heavier-than-history set forward", () => {
      const previous = [
        makeSet({ weight: 80, reps: 8 }),
        makeSet({ setNumber: 2, weight: 80, reps: 8 }),
      ];
      const current = [
        makeSet({ completed: true, weight: 82.5, reps: 8 }),
        makeSet({ setNumber: 2 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, previous, current);

      expect(placeholder?.weight).toBe(82.5);
      expect(placeholder?.reps).toBe(8);
    });

    it("carries the same weight with more reps forward", () => {
      const previous = [
        makeSet({ weight: 80, reps: 8 }),
        makeSet({ setNumber: 2, weight: 80, reps: 8 }),
      ];
      const current = [
        makeSet({ completed: true, weight: 80, reps: 10 }),
        makeSet({ setNumber: 2 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, previous, current);

      expect(placeholder?.weight).toBe(80);
      expect(placeholder?.reps).toBe(10);
    });

    it("follows last workout's pattern when the session replays it", () => {
      const previous = [
        makeSet({ weight: 100, reps: 5 }),
        makeSet({ setNumber: 2, weight: 90, reps: 8 }),
        makeSet({ setNumber: 3, weight: 80, reps: 10 }),
      ];
      const current = [
        makeSet({ completed: true, weight: 100, reps: 5 }),
        makeSet({ setNumber: 2 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, previous, current);

      expect(placeholder?.weight).toBe(90);
      expect(placeholder?.reps).toBe(8);
    });

    it("treats a set lighter than the slot's history as ramp-up", () => {
      const previous = [
        makeSet({ weight: 60, reps: 10 }),
        makeSet({ setNumber: 2, weight: 80, reps: 8 }),
      ];
      const current = [
        makeSet({ completed: true, weight: 60, reps: 5 }),
        makeSet({ setNumber: 2 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, previous, current);

      expect(placeholder?.weight).toBe(80);
      expect(placeholder?.reps).toBe(8);
    });

    it("suggests history's slot for a set typed as warmup", () => {
      const previous = [
        makeSet({ weight: 60, reps: 10 }),
        makeSet({ setNumber: 2, weight: 80, reps: 8 }),
      ];
      const current = [
        makeSet({ completed: true, weight: 80, reps: 8 }),
        makeSet({ setNumber: 2, type: "warmup" }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, previous, current);

      expect(placeholder?.weight).toBe(80);
      expect(placeholder?.reps).toBe(8);
    });

    it("carries the last session set forward past the end of history", () => {
      const previous = [
        makeSet({ weight: 80, reps: 8 }),
        makeSet({ setNumber: 2, weight: 80, reps: 8 }),
      ];
      const current = [
        makeSet({ completed: true, weight: 80, reps: 8 }),
        makeSet({ setNumber: 2, completed: true, weight: 80, reps: 8 }),
        makeSet({ setNumber: 3, completed: true, weight: 85, reps: 6 }),
        makeSet({ setNumber: 4 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(3, previous, current);

      expect(placeholder?.weight).toBe(85);
      expect(placeholder?.reps).toBe(6);
    });

    it("compares cardio sets by duration", () => {
      const previous = [
        makeSet({ duration: 10 }),
        makeSet({ setNumber: 2, duration: 20 }),
      ];
      const current = [
        makeSet({ completed: true, duration: 5 }),
        makeSet({ setNumber: 2 }),
      ];

      const placeholder = getPlaceholderWorkoutSet(1, previous, current);

      expect(placeholder?.duration).toBe(20);
    });
  });

  describe("summarizeWorkout()", () => {
    let nextId = 1;
    const makeSet = (overrides: Partial<WorkoutSetData>): WorkoutSetData => ({
      id: nextId++,
      workoutExerciseId: 1,
      createdAt: "",
      updatedAt: "",
      completed: true,
      reps: null,
      weight: null,
      duration: null,
      setNumber: 1,
      notes: null,
      type: "normal",
      suggestedReps: null,
      suggestedWeight: null,
      suggestedDuration: null,
      ...overrides,
    });
    const makeExercise = (
      category: ExerciseData["category"],
      workoutSets: WorkoutSetData[],
    ): WorkoutExerciseData => ({
      id: nextId++,
      workoutId: 1,
      exerciseId: 1,
      createdAt: "",
      updatedAt: "",
      exerciseOrder: 0,
      notes: null,
      workoutSets,
      exercise: {
        id: 1,
        name: category === "strength" ? "Bench Press" : "Rowing",
        userId: null,
        category,
        targetMuscleGroups: [],
        secondaryMuscleGroups: [],
        equipment: "",
        instructions: null,
        imageUrls: [],
        videoUrls: [],
        isFavorite: false,
        timesUsed: 0,
      },
    });
    const makeWorkout = (
      workoutExercises: WorkoutExerciseData[],
    ): WorkoutData => ({
      id: 1,
      createdAt: "",
      updatedAt: "",
      startedAt: "2025-01-01T10:00:00.000Z",
      userId: 1,
      status: "ACTIVE",
      notes: null,
      isPaused: false,
      pauseDuration: 0,
      lastPauseStartTime: null,
      activeDuration: 0,
      workoutExercises,
    });

    it("does not throw when an exercise has no sets", () => {
      // Regression: removing the last set of an exercise mid-workout used to
      // crash the app via an empty reduce with no initial value.
      const workout = makeWorkout([
        makeExercise("strength", []),
        makeExercise("cardio", []),
      ]);

      expect(() => summarizeWorkout(workout)).not.toThrow();
      const summary = summarizeWorkout(workout);
      expect(summary.workoutExercises).toEqual([]);
      expect(summary.totalWeight).toBe(0);
      expect(summary.totalCompletedSets).toBe(0);
    });

    it("keeps exercises with sets and picks the best set", () => {
      const workout = makeWorkout([
        makeExercise("strength", []),
        makeExercise("strength", [
          makeSet({ weight: 60, reps: 10 }),
          makeSet({ weight: 100, reps: 5 }),
        ]),
        makeExercise("cardio", [
          makeSet({ duration: 10 }),
          makeSet({ duration: 30 }),
        ]),
      ]);

      const summary = summarizeWorkout(workout);

      expect(summary.workoutExercises).toHaveLength(2);
      expect(summary.workoutExercises[0].bestSet).toMatchObject({
        weight: 100,
        reps: 5,
      });
      expect(summary.workoutExercises[1].bestSet).toMatchObject({
        duration: 30,
      });
      expect(summary.totalCompletedSets).toBe(4);
      expect(summary.totalWeight).toBe(60 * 10 + 100 * 5);
    });
  });
});
