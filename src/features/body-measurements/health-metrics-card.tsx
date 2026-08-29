"use client";

import Link from "next/link";

import { MeasurementData } from "@/api/body-measurements/types";
import { type UserProfileData } from "@/api/user-profile/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  computeFfmi,
  computeHealthMetrics,
  estimateNavyBodyFat,
} from "@/lib/body-metrics";
import { formatNumber } from "@/lib/utils";

function MetricRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <div>
        <span>{label}</span>
        {hint && <span className="text-muted-foreground ml-2 text-xs">{hint}</span>}
      </div>
      <span className="font-mono font-medium tabular-nums">{value}</span>
    </div>
  );
}

interface HealthMetricsCardProps {
  /** All measurements, newest first (as returned by the API). */
  measurements: MeasurementData[];
  profile: UserProfileData | null | undefined;
}

export default function HealthMetricsCard({
  measurements,
  profile,
}: HealthMetricsCardProps) {
  if (measurements.length === 0) return null;

  const latest = measurements[0];
  // Fat % and girths aren't logged every time — compute composition metrics
  // from the most recent entry that actually has them.
  const latestWithFat = measurements.find((m) => m.fatPercent != null);
  const latestWithGirths =
    profile?.sex &&
    measurements.find(
      (m) =>
        m.waistCm != null &&
        m.neckCm != null &&
        (profile.sex === "MALE" || m.hipsCm != null),
    );

  const metrics = computeHealthMetrics(
    { weight: latest.weight, fatPercent: null },
    profile ?? null,
  );

  const ffmi =
    latestWithFat && profile?.heightCm != null
      ? computeFfmi(
          latestWithFat.weight,
          latestWithFat.fatPercent!,
          profile.heightCm,
        )
      : null;

  const navyBodyFat =
    latestWithGirths && profile?.sex && profile.heightCm != null
      ? estimateNavyBodyFat({
          sex: profile.sex,
          heightCm: profile.heightCm,
          waistCm: latestWithGirths.waistCm!,
          neckCm: latestWithGirths.neckCm!,
          hipsCm: latestWithGirths.hipsCm,
        })
      : null;

  const rows = [
    metrics.bmi !== null && (
      <MetricRow
        key="bmi"
        label="BMI"
        value={formatNumber(metrics.bmi, { maximumFractionDigits: 1 })}
      />
    ),
    ffmi !== null && (
      <MetricRow
        key="ffmi"
        label="FFMI"
        hint="normalized to 1.8 m"
        value={formatNumber(ffmi, { maximumFractionDigits: 1 })}
      />
    ),
    metrics.bmr !== null && (
      <MetricRow
        key="bmr"
        label="BMR"
        hint="Mifflin-St Jeor"
        value={`${formatNumber(metrics.bmr, { maximumFractionDigits: 0 })} kcal/day`}
      />
    ),
    metrics.tdee !== null && (
      <MetricRow
        key="tdee"
        label="TDEE"
        value={`${formatNumber(metrics.tdee, { maximumFractionDigits: 0 })} kcal/day`}
      />
    ),
    navyBodyFat !== null && (
      <MetricRow
        key="navy"
        label="Body fat"
        hint="Navy tape estimate"
        value={`${formatNumber(navyBodyFat, { maximumFractionDigits: 1 })}%`}
      />
    ),
  ].filter(Boolean);

  const profileIncomplete =
    !profile ||
    profile.heightCm == null ||
    profile.birthDate == null ||
    profile.sex == null ||
    profile.activityLevel == null;

  if (rows.length === 0 && !profileIncomplete) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health metrics</CardTitle>
        <CardDescription>
          Calculated from your latest entry and body profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows}
        {profileIncomplete && (
          <p className="text-muted-foreground text-xs">
            Add height, birth date, sex and activity level in your{" "}
            <Link
              href="/app/body-measurements/profile"
              className="underline underline-offset-2"
            >
              body profile
            </Link>{" "}
            to unlock more metrics.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
