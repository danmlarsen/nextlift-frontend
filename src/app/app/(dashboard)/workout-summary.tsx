"use client";

import { useWorkoutChartData } from "@/api/workouts/queries";
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
import { formatCompactNumber } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function WorkoutSummary() {
  const { data } = useWorkoutChartData();

  console.log(data);

  if (!data) return null;

  const chartConfig = {
    totalVolume: {
      label: "Volume",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Training Volume</CardTitle>
        <CardDescription>kg</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data?.weekly}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => value.slice(-2)}
            />
            <YAxis
              dataKey="totalVolume"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickCount={8}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey="totalVolume"
              type="monotone"
              fill="red"
              fillOpacity={0.4}
              stroke="red)"
              dot={true}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
