import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { formatCompactNumber } from "@/lib/utils";
import { WorkoutChartPeriodData } from "@/api/workouts/types";

interface WorkoutChartProps {
  data: WorkoutChartPeriodData[];
  yKey: "totalVolume" | "workouts";
  label: string;
  periodFormatter?: (value: string) => string;
}

export default function WorkoutChart({
  data,
  yKey,
  label,
  periodFormatter,
}: WorkoutChartProps) {
  const chartConfig = {
    [yKey]: {
      label,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={data}
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
          tickFormatter={periodFormatter}
        />
        <YAxis
          dataKey={yKey}
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
          dataKey={yKey}
          type="monotone"
          fill="red"
          fillOpacity={0.4}
          stroke="red)"
          dot={true}
        />
      </AreaChart>
    </ChartContainer>
  );
}
