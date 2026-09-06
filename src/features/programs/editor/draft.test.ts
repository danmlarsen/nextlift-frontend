import { describe, expect, it } from "vitest";

import { type ProgramDayData } from "@/api/programs/types";
import {
  defaultParams,
  defaultStrategyForLevel,
  draftFromDay,
  draftToDto,
  moveItem,
  newExerciseDraft,
  parseNumber,
  spreadWeekdays,
} from "./draft";

const day: ProgramDayData = {
  id: 20,
  dayOrder: 1,
  name: "A1",
  weekday: null,
  notes: null,
  exercises: [
    {
      id: 30,
      exerciseId: 1,
      exerciseOrder: 1,
      progressionKey: "t1-squat",
      strategy: "LINEAR",
      progression: { strategy: "LINEAR", incrementKg: 5, failThreshold: 1 },
      roundingKg: null,
      restSeconds: 180,
      notes: null,
      exercise: {
        id: 1,
        name: "Barbell Squat",
        equipment: "barbell",
        category: "strength",
      },
      sets: [
        {
          id: 40,
          weekInBlock: null,
          setOrder: 1,
          type: "normal",
          repsMin: 3,
          repsMax: 3,
          isAmrap: false,
          percent: null,
          weight: null,
          targetRpe: null,
          restSeconds: null,
          duration: null,
          notes: null,
        },
        {
          id: 41,
          weekInBlock: 2,
          setOrder: 1,
          type: "normal",
          repsMin: 3,
          repsMax: null,
          isAmrap: true,
          percent: 85,
          weight: null,
          targetRpe: 8,
          restSeconds: 120,
          duration: null,
          notes: "belt",
        },
      ],
    },
  ],
};

describe("editor draft", () => {
  it("round-trips server content through the draft into the API shape", () => {
    const draft = draftFromDay(day);
    expect(draft[0]).toMatchObject({
      exerciseId: 1,
      progressionKey: "t1-squat",
      strategy: "LINEAR",
      restSeconds: "180",
      roundingKg: "",
    });
    expect(draft[0].sets[1]).toMatchObject({
      weekInBlock: 2,
      repsMin: "3",
      repsMax: "",
      percent: "85",
      targetRpe: "8",
      notes: "belt",
    });

    const dto = draftToDto(draft);
    expect(dto.exercises[0]).toMatchObject({
      exerciseId: 1,
      progressionKey: "t1-squat",
      strategy: "LINEAR",
      progression: { strategy: "LINEAR", incrementKg: 5, failThreshold: 1 },
      restSeconds: 180,
      roundingKg: null,
      notes: null,
    });
    expect(dto.exercises[0].sets).toEqual([
      expect.objectContaining({
        weekInBlock: null,
        repsMin: 3,
        repsMax: 3,
        isAmrap: false,
        percent: null,
        targetRpe: null,
        notes: null,
      }),
      expect.objectContaining({
        weekInBlock: 2,
        repsMin: 3,
        repsMax: 3,
        isAmrap: true,
        percent: 85,
        targetRpe: 8,
        restSeconds: 120,
        notes: "belt",
      }),
    ]);
  });

  it("gives NONE slots explicit params and generates keys", () => {
    const draft = draftFromDay(day);
    draft[0].strategy = "NONE";
    draft[0].progression = null;
    draft[0].progressionKey = "";
    const dto = draftToDto(draft);
    expect(dto.exercises[0].progression).toEqual({ strategy: "NONE" });
    expect(dto.exercises[0].progressionKey).toBe("ex-1");
  });

  it("parses numeric inputs leniently", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber(" 62.5 ")).toBe(62.5);
    expect(parseNumber("abc")).toBeNull();
  });

  it("picks level-appropriate defaults for new exercises", () => {
    expect(defaultStrategyForLevel("BEGINNER")).toBe("LINEAR");
    expect(defaultStrategyForLevel("INTERMEDIATE")).toBe("DOUBLE");
    expect(defaultStrategyForLevel("ELITE")).toBe("RPE");

    const exercise = newExerciseDraft(
      { id: 7, name: "Deadlift", equipment: "barbell", category: "strength" },
      "NOVICE",
    );
    expect(exercise).toMatchObject({
      exerciseId: 7,
      progressionKey: "ex-7",
      strategy: "LINEAR",
      progression: { strategy: "LINEAR", incrementKg: 2.5 },
    });
    expect(exercise.sets).toHaveLength(3);
    expect(defaultParams("RPE", "RIR_MESOCYCLE")).toMatchObject({
      mode: "RIR_MESOCYCLE",
      startRir: 3,
    });
    expect(defaultParams("NONE")).toEqual({ strategy: "NONE" });
  });

  it("moves items and spreads weekdays", () => {
    expect(moveItem([1, 2, 3], 0, 1)).toEqual([2, 1, 3]);
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
    expect(spreadWeekdays(3)).toEqual([1, 3, 5]);
    expect(spreadWeekdays(4)).toEqual([1, 2, 4, 5]);
    expect(spreadWeekdays(9)).toHaveLength(7);
  });
});
