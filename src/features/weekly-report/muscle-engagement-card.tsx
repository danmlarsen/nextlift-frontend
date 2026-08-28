import { type WeeklyReportMuscle } from "@/api/workouts/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BodyHeatmap, { type MuscleHeat } from "./body-heatmap";
import { DRAWABLE_MUSCLES } from "./body-paths";
import { HEAT_BINS } from "./heat-scale";

const TOP_MUSCLES_COUNT = 5;

export default function MuscleEngagementCard({
  muscles,
}: {
  muscles: WeeklyReportMuscle[];
}) {
  const maxScore = muscles.reduce(
    (max, muscle) => Math.max(max, muscle.score),
    0,
  );
  const heatByMuscle = new Map<string, MuscleHeat>(
    muscles.map((muscle) => [
      muscle.muscleGroup,
      { t: maxScore > 0 ? muscle.score / maxScore : 0, sets: muscle.sets },
    ]),
  );
  const sortedMuscles = [...muscles].sort((a, b) => b.score - a.score);
  const topMuscles = sortedMuscles.slice(0, TOP_MUSCLES_COUNT);
  const undrawableMuscles = sortedMuscles.filter(
    (muscle) => !DRAWABLE_MUSCLES.has(muscle.muscleGroup),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Muscle engagement</CardTitle>
        <CardDescription>
          Completed sets per muscle group this week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <BodyHeatmap view="front" heatByMuscle={heatByMuscle} />
          <BodyHeatmap view="back" heatByMuscle={heatByMuscle} />
        </div>
        <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
          <span>Less</span>
          {HEAT_BINS.map((bin, index) => (
            <span
              key={index}
              className="size-3 rounded-[2px]"
              style={{
                backgroundColor: bin.fill,
                opacity: bin.fillOpacity,
              }}
            />
          ))}
          <span>More</span>
        </div>
        {muscles.length === 0 ? (
          <p className="text-muted-foreground text-center">
            No workouts this week.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="font-medium">Top muscles</p>
            <ul className="space-y-1">
              {topMuscles.map((muscle) => (
                <li
                  key={muscle.muscleGroup}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize">{muscle.muscleGroup}</span>
                  <span className="text-muted-foreground">
                    {muscle.sets} {muscle.sets === 1 ? "set" : "sets"}
                  </span>
                </li>
              ))}
            </ul>
            {undrawableMuscles.length > 0 && (
              <p className="text-muted-foreground text-xs">
                Also trained:{" "}
                {undrawableMuscles
                  .map((muscle) => `${muscle.muscleGroup} (${muscle.sets})`)
                  .join(", ")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
