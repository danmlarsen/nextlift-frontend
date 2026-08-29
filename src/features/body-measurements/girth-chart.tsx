"use client";

import { useState } from "react";

import { MeasurementData } from "@/api/body-measurements/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/utils";
import MeasurementTrendChart from "./measurement-trend-chart";

const GIRTH_SITES = [
  { key: "neckCm", label: "Neck" },
  { key: "chestCm", label: "Chest" },
  { key: "waistCm", label: "Waist" },
  { key: "hipsCm", label: "Hips" },
  { key: "armCm", label: "Arm" },
  { key: "thighCm", label: "Thigh" },
  { key: "calfCm", label: "Calf" },
] as const;

type GirthKey = (typeof GIRTH_SITES)[number]["key"];

interface GirthChartProps {
  /** Measurements within the selected range, any order. */
  measurements: MeasurementData[];
}

export default function GirthChart({ measurements }: GirthChartProps) {
  const pointsFor = (key: GirthKey) =>
    measurements
      .filter((m) => m[key] != null)
      .map((m) => ({ time: new Date(m.measuredAt).getTime(), value: m[key]! }))
      .sort((a, b) => a.time - b.time);

  const availableSites = GIRTH_SITES.filter(
    (site) => pointsFor(site.key).length >= 2,
  );

  const [selected, setSelected] = useState<GirthKey | null>(null);
  // Fall back to the first chartable site until the user picks one — or when
  // a range change leaves the picked site without enough points.
  const activeKey = availableSites.some((site) => site.key === selected)
    ? selected!
    : availableSites[0]?.key;

  if (availableSites.length === 0 || !activeKey) return null;

  const activeSite = GIRTH_SITES.find((site) => site.key === activeKey)!;
  const points = pointsFor(activeKey);
  const latest = points[points.length - 1];
  const previous = points[points.length - 2];
  const change = latest.value - previous.value;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurements</CardTitle>
        <CardDescription>
          {activeSite.label}: {formatNumber(latest.value)} cm
          {change !== 0 &&
            ` (${change > 0 ? "+" : ""}${formatNumber(change)} cm since previous)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Tabs
            value={activeKey}
            onValueChange={(value) => setSelected(value as GirthKey)}
          >
            <TabsList>
              {availableSites.map((site) => (
                <TabsTrigger key={site.key} value={site.key}>
                  {site.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <MeasurementTrendChart
          unit="cm"
          points={points}
          series={[
            {
              key: "value",
              label: activeSite.label,
              color: "var(--chart-5)",
              showDots: true,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
