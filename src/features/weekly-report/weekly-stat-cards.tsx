import { type WeeklyReportData } from "@/api/workouts/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatWeight } from "@/lib/utils";

function StatCard({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center space-y-2 text-center">
        <p className="text-3xl font-bold lg:text-4xl">{value}</p>
        <p className="text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

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
