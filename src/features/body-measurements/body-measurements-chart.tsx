"use client";

import { format } from "date-fns";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { useBodyMeasurements } from "@/api/body-measurements/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

const chartConfig = {
  weight: {
    label: "Bodyweight",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function BodyMeasurementsChart() {
  const { data, isLoading, isSuccess } = useBodyMeasurements();

  if (isLoading) {
    return <Skeleton className="h-[250px] rounded-xl" />;
  }

  // The list below reports errors; a trend needs at least two points.
  if (!isSuccess || data.length < 2) return null;

  const points = data
    .map((measurement) => ({
      time: new Date(measurement.measuredAt).getTime(),
      weight: measurement.weight,
    }))
    .sort((a, b) => a.time - b.time);

  const weights = points.map((point) => point.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  // Zoom the axis to the measured range — a 2 kg change should be visible,
  // which a zero-based axis would flatten into a straight line.
  const padding = Math.max(0.5, (max - min) * 0.15);
  const domain = [
    Math.floor((min - padding) * 2) / 2,
    Math.ceil((max + padding) * 2) / 2,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bodyweight trend</CardTitle>
        <CardDescription>
          Logged bodyweight over time (kg) — axis zoomed to your range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={points}
            margin={{ left: 4, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: number) => format(value, "MMM d")}
            />
            <YAxis
              dataKey="weight"
              domain={domain}
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickCount={6}
              tickFormatter={(value: number) =>
                formatNumber(value, { maximumFractionDigits: 1 })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const time = payload?.[0]?.payload?.time as
                      | number
                      | undefined;
                    return time ? format(time, "MMM d, yyyy") : "";
                  }}
                  formatter={(value) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: "var(--chart-1)" }}
                      />
                      <span className="text-muted-foreground">Bodyweight</span>
                      <span className="text-foreground ml-auto font-mono font-medium tabular-nums">
                        {formatNumber(Number(value), {
                          maximumFractionDigits: 1,
                        })}{" "}
                        kg
                      </span>
                    </>
                  )}
                />
              }
            />
            <Line
              dataKey="weight"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ fill: "var(--chart-1)", strokeWidth: 0, r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
