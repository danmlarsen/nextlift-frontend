export type Sex = "MALE" | "FEMALE";

export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHT"
  | "MODERATE"
  | "ACTIVE"
  | "VERY_ACTIVE";

export type WeightGoal = "LOSE" | "MAINTAIN" | "GAIN";

export type UserProfileData = {
  id: number;
  heightCm: number | null;
  birthDate: string | null;
  sex: Sex | null;
  activityLevel: ActivityLevel | null;
  goalWeight: number | null;
  weightGoal: WeightGoal | null;
};

export type UpsertUserProfileDto = {
  heightCm?: number | null;
  birthDate?: string | null;
  sex?: Sex | null;
  activityLevel?: ActivityLevel | null;
  goalWeight?: number | null;
  weightGoal?: WeightGoal | null;
};
