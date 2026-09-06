import { type Adherence } from "@/api/program-enrollments/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdherenceCardProps {
  adherence: Adherence;
}

export default function AdherenceCard({ adherence }: AdherenceCardProps) {
  const { planned, completed, skipped, missed, plannedElapsed } = adherence;
  const percent =
    plannedElapsed > 0 ? Math.round((completed / plannedElapsed) * 100) : null;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Adherence</CardTitle>
        <span className="text-muted-foreground text-sm">
          {completed} of {planned} days
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="bg-muted/40 h-2 w-full overflow-hidden rounded-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={planned}
          aria-valuenow={completed}
          aria-label="Completed days"
        >
          <div
            className="bg-accent h-full rounded-full transition-all"
            style={{
              width: `${planned > 0 ? (completed / planned) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="grid grid-cols-3 text-center text-sm">
          <div>
            <p className="text-lg font-bold">
              {percent === null ? "–" : `${percent}%`}
            </p>
            <p className="text-muted-foreground text-xs">done so far</p>
          </div>
          <div>
            <p className="text-lg font-bold">{skipped}</p>
            <p className="text-muted-foreground text-xs">skipped</p>
          </div>
          <div>
            <p className="text-lg font-bold">{missed}</p>
            <p className="text-muted-foreground text-xs">missed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
