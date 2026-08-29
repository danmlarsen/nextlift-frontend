"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MeasurementTrendChart from "./measurement-trend-chart";

export type WeightChartPoint = {
  time: number;
  weight: number;
  trend: number;
};

interface BodyMeasurementsChartProps {
  points: WeightChartPoint[];
  goalWeight?: number | null;
}

export default function BodyMeasurementsChart({
  points,
  goalWeight,
}: BodyMeasurementsChartProps) {
  // A trend needs at least two points.
  if (points.length < 2) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bodyweight trend</CardTitle>
        <CardDescription>
          Logged bodyweight and 7-day average (kg) — axis zoomed to your range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MeasurementTrendChart
          unit="kg"
          points={points}
          referenceY={
            goalWeight != null
              ? { value: goalWeight, label: "Goal" }
              : undefined
          }
          series={[
            {
              key: "weight",
              label: "Bodyweight",
              color: "var(--chart-1)",
              strokeWidth: 1,
              showDots: true,
            },
            {
              key: "trend",
              label: "7-day average",
              color: "var(--chart-2)",
              strokeWidth: 2,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
