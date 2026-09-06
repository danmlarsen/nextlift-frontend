export const PROGRAM_GOALS = [
  "STRENGTH",
  "HYPERTROPHY",
  "GENERAL_FITNESS",
  "POWERLIFTING",
  "ENDURANCE",
  "ATHLETIC",
] as const;
export type ProgramGoal = (typeof PROGRAM_GOALS)[number];

export const PROGRAM_LEVELS = [
  "BEGINNER",
  "NOVICE",
  "INTERMEDIATE",
  "ADVANCED",
  "ELITE",
] as const;
export type ProgramLevel = (typeof PROGRAM_LEVELS)[number];

export type ProgramScheduleMode = "SEQUENCE" | "CALENDAR";
export type ProgramDurationMode = "FIXED" | "OPEN_ENDED";
export type EffortScale = "RPE" | "RIR";
export type ProgramVisibility = "PRIVATE" | "SYSTEM";
export type ProgressionStrategy =
  "NONE" | "LINEAR" | "DOUBLE" | "PERCENT_TM" | "RPE";

export type LinearStage = { sets: number; reps: number; amrapLast?: boolean };

export type ProgressionParams =
  | {
      strategy: "LINEAR";
      incrementKg: number;
      failThreshold?: number;
      deloadPercent?: number;
      stages?: LinearStage[];
      stageResetPercent?: number;
      amrapRepsThreshold?: number;
    }
  | {
      strategy: "DOUBLE";
      incrementKg: number;
      mode?: "LOAD" | "REPS";
      repsStep?: number;
    }
  | {
      strategy: "PERCENT_TM";
      tmPercentOf1RM?: number;
      tmIncrementKg: number;
      tmAdvance?: "CYCLE_END" | "AMRAP" | "NONE";
      amrapTmRule?: {
        minReps: number;
        maxReps: number | null;
        incrementKg: number;
      }[];
    }
  | {
      strategy: "RPE";
      mode: "TOP_SET_BACKOFF";
      backoffPercent: number;
      backoffSets: number;
    }
  | {
      strategy: "RPE";
      mode: "RIR_MESOCYCLE";
      startRir: number;
      endRir: number;
      addSetsPerWeek: number;
      maxSets: number;
      incrementKg: number;
    }
  | {
      strategy: "NONE";
      basis?: "FIXED" | "WORKING_WEIGHT" | "TRAINING_MAX";
    };

export type ProgramExerciseInfo = {
  id: number;
  name: string;
  equipment: string;
  category: string;
};

export type ProgramSetData = {
  id: number;
  weekInBlock: number | null;
  setOrder: number;
  type: string;
  repsMin: number | null;
  repsMax: number | null;
  isAmrap: boolean;
  percent: number | null;
  weight: number | null;
  targetRpe: number | null;
  restSeconds: number | null;
  duration: number | null;
  notes: string | null;
};

export type ProgramExerciseData = {
  id: number;
  exerciseId: number;
  exerciseOrder: number;
  progressionKey: string;
  strategy: ProgressionStrategy;
  progression: ProgressionParams | null;
  roundingKg: number | null;
  restSeconds: number | null;
  notes: string | null;
  exercise: ProgramExerciseInfo;
  sets: ProgramSetData[];
};

export type ProgramDayData = {
  id: number;
  dayOrder: number;
  name: string;
  weekday: number | null;
  notes: string | null;
  exercises: ProgramExerciseData[];
};

export type ProgramWeekData = {
  id: number;
  weekInBlock: number;
  label: string | null;
  isDeload: boolean;
  volumeMultiplier: number;
  intensityMultiplier: number;
};

export type ProgramBlockData = {
  id: number;
  blockOrder: number;
  name: string;
  focus: string | null;
  weeks: ProgramWeekData[];
  days: ProgramDayData[];
};

export type ProgramMeta = {
  id: number;
  userId: number;
  slug: string | null;
  version: number;
  name: string;
  description: string | null;
  credit: string | null;
  goal: ProgramGoal;
  level: ProgramLevel;
  scheduleMode: ProgramScheduleMode;
  durationMode: ProgramDurationMode;
  daysPerWeek: number;
  effortScale: EffortScale;
  visibility: ProgramVisibility;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  isSystem: boolean;
};

export type ProgramSummaryData = ProgramMeta & { totalWeeks: number };

export type ProgramData = ProgramMeta & { blocks: ProgramBlockData[] };

/** The immutable program copy stored on an enrollment. */
export type ProgramSnapshotData = {
  id: number;
  version: number;
  name: string;
  description: string | null;
  credit: string | null;
  goal: ProgramGoal;
  level: ProgramLevel;
  scheduleMode: ProgramScheduleMode;
  durationMode: ProgramDurationMode;
  daysPerWeek: number;
  effortScale: EffortScale;
  blocks: ProgramBlockData[];
};

export type ProgramsResponse = {
  success: boolean;
  meta: { hasNextPage: boolean; nextCursor: number | null };
  data: ProgramSummaryData[];
};

export type ProgramScope = "system" | "mine";

export type ProgramsQueryFilters = {
  scope: ProgramScope;
  goal?: ProgramGoal;
  level?: ProgramLevel;
  daysPerWeek?: number;
};

export type EnrollDefaultField = "workingWeight" | "trainingMax" | "e1rm";

export type EnrollDefaultData = {
  progressionKey: string;
  exerciseId: number;
  exerciseName: string;
  strategy: ProgressionStrategy;
  field: EnrollDefaultField | null;
  suggested: number | null;
  source: "LAST_WORKOUT" | "PR_1RM" | null;
  roundingKg: number;
};

export type EnrollDefaultsData = {
  programId: number;
  problems: string[];
  defaults: EnrollDefaultData[];
};

export function totalWeeksOf(program: { blocks: { weeks: unknown[] }[] }) {
  return program.blocks.reduce((sum, block) => sum + block.weeks.length, 0);
}

// --- Authoring DTOs (mirror src/programs/dtos in the backend) -----------------

export type CreateProgramDto = {
  name: string;
  description?: string | null;
  goal: ProgramGoal;
  level: ProgramLevel;
  scheduleMode?: ProgramScheduleMode;
  durationMode?: ProgramDurationMode;
  daysPerWeek: number;
  effortScale?: EffortScale;
};

export type UpdateProgramDto = Partial<CreateProgramDto>;

export type CreateProgramBlockDto = {
  name: string;
  focus?: string | null;
  weeks?: number;
};

export type UpdateProgramBlockDto = {
  name?: string;
  focus?: string | null;
  weeks?: number;
  blockOrder?: number;
};

export type UpdateProgramWeekDto = {
  label?: string | null;
  isDeload?: boolean;
  volumeMultiplier?: number;
  intensityMultiplier?: number;
};

export type CreateProgramDayDto = {
  name: string;
  weekday?: number | null;
  notes?: string | null;
};

export type UpdateProgramDayDto = {
  name?: string;
  weekday?: number | null;
  notes?: string | null;
  dayOrder?: number;
};

export type ProgramSetInputDto = {
  weekInBlock?: number | null;
  type?: string;
  repsMin?: number | null;
  repsMax?: number | null;
  isAmrap?: boolean;
  percent?: number | null;
  weight?: number | null;
  targetRpe?: number | null;
  restSeconds?: number | null;
  duration?: number | null;
  notes?: string | null;
};

export type ProgramExerciseInputDto = {
  exerciseId: number;
  progressionKey?: string;
  strategy: ProgressionStrategy;
  progression?: ProgressionParams | null;
  roundingKg?: number | null;
  restSeconds?: number | null;
  notes?: string | null;
  sets: ProgramSetInputDto[];
};

export type PutDayContentDto = { exercises: ProgramExerciseInputDto[] };
