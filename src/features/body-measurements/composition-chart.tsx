"use client";

import { MeasurementData } from "@/api/body-measurements/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { computeLeanFatMass } from "@/lib/body-metrics";
import MeasurementTrendChart from "./measurement-trend-chart";

interface CompositionChartProps {
  /** Measurements within the selected range, any order. */
  measurements: MeasurementData[];
}

export default function CompositionChart({
  measurements,
}: CompositionChartProps) {
  const points = measurements
    .filter((m) => m.fatPercent != null)
    .map((m) => {
      const { leanMass, fatMass } = computeLeanFatMass(
        m.weight,
        m.fatPercent!,
      );
      return {
        time: new Date(m.measuredAt).getTime(),
        leanMass,
        fatMass,
      };
    })
    .sort((a, b) => a.time - b.time);

  if (points.length < 2) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body composition</CardTitle>
        <CardDescription>
          Lean and fat mass (kg) from entries with a body fat %
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MeasurementTrendChart
          unit="kg"
          points={points}
          series={[
            {
              key: "leanMass",
              label: "Lean mass",
              color: "var(--chart-3)",
              showDots: true,
            },
            {
              key: "fatMass",
              label: "Fat mass",
              color: "var(--chart-4)",
              showDots: true,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
