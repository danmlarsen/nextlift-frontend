import { type WeeklyReportData } from "@/api/workouts/types";
import StatCard from "@/components/stat-card";
import { formatNumber, formatWeight } from "@/lib/utils";

export default function WeeklyStatCards({ data }: { data: WeeklyReportData }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard value={formatNumber(data.totalWorkouts)} label="Workouts" />
      <StatCard value={formatNumber(data.totalMinutes)} label="Minutes" />
      <StatCard
        value={
          <span className="relative">
            {formatWeight(data.totalWeightLifted)}{" "}
            <span className="text-muted-foreground absolute top-0 -right-5 text-sm font-light">
              kg
            </span>
          </span>
        }
        label="Lifted"
      />
      <StatCard value={formatNumber(data.weekStreak)} label="Week streak" />
    </div>
  );
}
