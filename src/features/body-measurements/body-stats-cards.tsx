"use client";

import { format } from "date-fns";

import { type UserProfileData } from "@/api/user-profile/types";
import StatCard from "@/components/stat-card";
import StatDelta from "@/components/stat-delta";
import {
  projectGoalDate,
  type BodyStats,
  type GoalProjection,
} from "@/lib/body-metrics";
import { formatNumber } from "@/lib/utils";

function kgValue(value: number, options?: { signed?: boolean }) {
  const formatted = formatNumber(value, { maximumFractionDigits: 1 });
  return (
    <span className="relative">
      {options?.signed && value > 0 ? `+${formatted}` : formatted}{" "}
      <span className="text-muted-foreground absolute top-0 -right-5 text-sm font-light">
        kg
      </span>
    </span>
  );
}

function goalCaption(goalWeight: number, projection: GoalProjection) {
  if (projection?.kind === "date") {
    return `Goal ${formatNumber(goalWeight)} kg · projected ${format(projection.date, "PP")}`;
  }
  if (projection?.kind === "tooFar") {
    return `Goal ${formatNumber(goalWeight)} kg · over 2 years at the current rate`;
  }
  return `Goal ${formatNumber(goalWeight)} kg`;
}

interface BodyStatsCardsProps {
  stats: BodyStats;
  profile: UserProfileData | null | undefined;
}

export default function BodyStatsCards({ stats, profile }: BodyStatsCardsProps) {
  const goalWeight = profile?.goalWeight ?? null;
  const weightGoal = profile?.weightGoal ?? null;

  const projection =
    goalWeight != null
      ? projectGoalDate(stats.trend, stats.ratePerWeek, goalWeight)
      : null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        <StatCard value={kgValue(stats.current)} label="Current" />
        <StatCard value={kgValue(stats.trend)} label="7-day average" />
        <StatCard
          value={kgValue(stats.totalChange, { signed: true })}
          label="Change"
          sub={
            // Without a stated goal direction there is no good or bad change,
            // so skip the colored badge rather than guess.
            weightGoal === "LOSE" || weightGoal === "GAIN" ? (
              <StatDelta
                current={stats.current}
                previous={stats.first}
                mode="absolute"
                unit="kg"
                suffix="in range"
                increaseIsGood={weightGoal === "GAIN"}
              />
            ) : undefined
          }
        />
        <StatCard
          value={
            stats.ratePerWeek === null ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              kgValue(stats.ratePerWeek, { signed: true })
            )
          }
          label="Per week"
        />
      </div>
      {goalWeight != null && (
        <p className="text-muted-foreground text-center text-sm">
          {goalCaption(goalWeight, projection)}
        </p>
      )}
    </div>
  );
}
