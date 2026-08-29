"use client";

import { format } from "date-fns";
import {
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
import { paddedDomain } from "@/lib/body-metrics";
import { formatNumber } from "@/lib/utils";

export type TrendChartSeries = {
  key: string;
  label: string;
  color: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  showDots?: boolean;
};

export type TrendChartPoint = { time: number } & {
  [key: string]: number | null;
};

interface MeasurementTrendChartProps {
  series: TrendChartSeries[];
  points: TrendChartPoint[];
  unit: string;
  referenceY?: { value: number; label: string };
  className?: string;
}

/**
 * Time-scaled line chart for sparse, irregularly logged measurements: only
 * real points are plotted (no zero-filled buckets) and the Y axis is zoomed
 * to the measured range.
 */
export default function MeasurementTrendChart({
  series,
  points,
  unit,
  referenceY,
  className,
}: MeasurementTrendChartProps) {
  const chartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;

  const values = points.flatMap((point) =>
    series
      .map((s) => point[s.key])
      .filter((value): value is number => typeof value === "number"),
  );
  if (referenceY) values.push(referenceY.value);
  if (values.length === 0) return null;

  const domain = paddedDomain(values);
  const seriesByKey = new Map(series.map((s) => [s.key, s]));

  return (
    <ChartContainer
      config={chartConfig}
      className={className ?? "max-h-[250px] w-full"}
    >
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
                const time = payload?.[0]?.payload?.time as number | undefined;
                return time ? format(time, "MMM d, yyyy") : "";
              }}
              formatter={(value, name) => {
                const s = seriesByKey.get(String(name));
                return (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: s?.color }}
                    />
                    <span className="text-muted-foreground">
                      {s?.label ?? name}
                    </span>
                    <span className="text-foreground ml-auto font-mono font-medium tabular-nums">
                      {formatNumber(Number(value), {
                        maximumFractionDigits: 1,
                      })}{" "}
                      {unit}
                    </span>
                  </>
                );
              }}
            />
          }
        />
        {referenceY && (
          <ReferenceLine
            y={referenceY.value}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            label={{
              value: referenceY.label,
              position: "insideTopRight",
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
          />
        )}
        {series.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            type="monotone"
            connectNulls
            stroke={s.color}
            strokeWidth={s.strokeWidth ?? 2}
            strokeDasharray={s.strokeDasharray}
            dot={
              s.showDots ? { fill: s.color, strokeWidth: 0, r: 3 } : false
            }
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
