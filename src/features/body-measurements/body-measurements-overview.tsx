"use client";

import { useState } from "react";
import Link from "next/link";

import { useBodyMeasurements } from "@/api/body-measurements/queries";
import { useUserProfile } from "@/api/user-profile/queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  computeBodyStats,
  computeTrendSeries,
  rangeStartTime,
  type BodyMeasurementRange,
} from "@/lib/body-metrics";
import BodyMeasurementsChart from "./body-measurements-chart";
import BodyMeasurementsList from "./body-measurements-list";
import BodyStatsCards from "./body-stats-cards";
import CompositionChart from "./composition-chart";
import GirthChart from "./girth-chart";
import HealthMetricsCard from "./health-metrics-card";

const RANGE_OPTIONS: Array<{ value: BodyMeasurementRange; label: string }> = [
  { value: "30d", label: "30 days" },
  { value: "12w", label: "12 weeks" },
  { value: "6m", label: "6 months" },
  { value: "all", label: "All" },
];

export default function BodyMeasurementsOverview() {
  const [range, setRange] = useState<BodyMeasurementRange>("12w");
  const { data, isLoading, isSuccess } = useBodyMeasurements();
  const { data: profile, isSuccess: profileLoaded } = useUserProfile();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[120px] rounded-xl" />
        <Skeleton className="h-[250px] rounded-xl" />
        <Skeleton className="h-[72px] rounded-lg" />
      </div>
    );
  }

  // The list below reports load errors.
  if (!isSuccess) {
    return <BodyMeasurementsList />;
  }

  const rangeStart = rangeStartTime(range);

  // The trend average is computed over the full history so points near the
  // start of the visible range still use their trailing window.
  const allPoints = data
    .map((m) => ({ time: new Date(m.measuredAt).getTime(), weight: m.weight }))
    .sort((a, b) => a.time - b.time);
  const trendSeries = computeTrendSeries(allPoints);
  const chartPoints = allPoints
    .map((point, idx) => ({ ...point, trend: trendSeries[idx].trend }))
    .filter((point) => rangeStart === null || point.time >= rangeStart);

  const rangeMeasurements = data.filter(
    (m) => rangeStart === null || new Date(m.measuredAt).getTime() >= rangeStart,
  );
  const stats = computeBodyStats(
    chartPoints.map(({ time, weight }) => ({ time, weight })),
  );

  return (
    <div className="space-y-4">
      {profileLoaded && profile === null && (
        <Card>
          <CardHeader>
            <CardTitle>Set up your body profile</CardTitle>
            <CardDescription>
              Height, birth date and a goal weight unlock BMI, BMR and goal
              tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/app/body-measurements/profile">Set up profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {data.length > 0 && (
        <div className="flex justify-end">
          <Tabs
            value={range}
            onValueChange={(value) => setRange(value as BodyMeasurementRange)}
          >
            <TabsList>
              {RANGE_OPTIONS.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {data.length > 0 && chartPoints.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No entries in this range.
        </p>
      )}

      {stats && <BodyStatsCards stats={stats} profile={profile} />}
      <BodyMeasurementsChart
        points={chartPoints}
        goalWeight={profile?.goalWeight}
      />
      <HealthMetricsCard measurements={data} profile={profile} />
      <CompositionChart measurements={rangeMeasurements} />
      <GirthChart measurements={rangeMeasurements} />
      <BodyMeasurementsList />
    </div>
  );
}
