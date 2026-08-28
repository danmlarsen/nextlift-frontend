"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { formatCompactNumber } from "@/lib/utils";
import {
  type ChartGranularity,
  formatPeriodTick,
  formatPeriodTooltipLabel,
} from "@/lib/chart-format";

export interface WorkoutChartDatum {
  period: string;
  [key: string]: number | string;
}

interface WorkoutChartProps {
  data: WorkoutChartDatum[];
  yKey: string;
  label: string;
  granularity: ChartGranularity;
  unit?: string;
  color?: string;
  variant?: "area" | "bar" | "line";
  showAverage?: boolean;
  integerYAxis?: boolean;
}

export default function WorkoutChart({
  data,
  yKey,
  label,
  granularity,
  unit,
  color = "var(--chart-1)",
  variant = "area",
  showAverage = false,
  integerYAxis = false,
}: WorkoutChartProps) {
  const gradientId = useId();

  const chartConfig = {
    [yKey]: {
      label,
      color,
    },
  } satisfies ChartConfig;

  const values = data.map((point) => Number(point[yKey]) || 0);
  const average =
    values.length > 0
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : 0;

  const xAxis = (
    <XAxis
      dataKey="period"
      tickLine={true}
      axisLine={true}
      tickMargin={8}
      minTickGap={24}
      tickFormatter={(value: string) => formatPeriodTick(value, granularity)}
    />
  );

  const yAxis = (
    <YAxis
      tickLine={true}
      axisLine={true}
      tickMargin={8}
      tickCount={6}
      allowDecimals={!integerYAxis}
      tickFormatter={(value: number) => formatCompactNumber(value)}
    />
  );

  const tooltip = (
    <ChartTooltip
      cursor={variant === "bar"}
      content={
        <ChartTooltipContent
          labelFormatter={(value) =>
            formatPeriodTooltipLabel(String(value), granularity)
          }
          formatter={(value, name) => (
            <>
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">
                {chartConfig[name as string]?.label ?? name}
              </span>
              <span className="text-foreground ml-auto font-mono font-medium tabular-nums">
                {Number(value).toLocaleString()}
                {unit ? ` ${unit}` : ""}
              </span>
            </>
          )}
        />
      }
    />
  );

  const averageLine = showAverage && average > 0 && (
    <ReferenceLine
      y={average}
      stroke="var(--muted-foreground)"
      strokeDasharray="4 4"
      strokeOpacity={0.7}
      label={{
        value: "avg",
        position: "insideTopRight",
        fill: "var(--muted-foreground)",
        fontSize: 11,
      }}
    />
  );

  const margin = { left: 4, right: 12 };

  if (variant === "bar") {
    return (
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={data} margin={margin}>
          <CartesianGrid vertical={false} />
          {xAxis}
          {yAxis}
          {tooltip}
          {averageLine}
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ChartContainer>
    );
  }

  if (variant === "line") {
    return (
      <ChartContainer config={chartConfig}>
        <LineChart accessibilityLayer data={data} margin={margin}>
          <CartesianGrid vertical={false} />
          {xAxis}
          {yAxis}
          {tooltip}
          {averageLine}
          <Line
            dataKey={yKey}
            type="monotone"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 0, r: 3 }}
            connectNulls
          />
        </LineChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart accessibilityLayer data={data} margin={margin}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        {xAxis}
        {yAxis}
        {tooltip}
        {averageLine}
        <Area
          dataKey={yKey}
          type="monotone"
          fill={`url(#${gradientId})`}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 0, r: 3 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
