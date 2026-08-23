import { format } from "date-fns";
import { TrophyIcon } from "lucide-react";

import {
  RECORD_TYPE_LABELS,
  type ExerciseRecords,
  type PersonalRecordSetData,
} from "@/api/personal-records/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

function formatRecordSet(set: PersonalRecordSetData): string {
  if (set.weight !== null && set.reps !== null) {
    return `${set.weight} kg × ${set.reps}`;
  }
  if (set.weight !== null) {
    return `${set.weight} kg`;
  }
  if (set.duration !== null) {
    return `${set.duration} min`;
  }
  return "";
}

interface PersonalRecordCardProps {
  exerciseRecords: ExerciseRecords;
}

export default function PersonalRecordCard({
  exerciseRecords,
}: PersonalRecordCardProps) {
  return (
    <li>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon
              className="size-4 shrink-0 text-amber-500"
              aria-hidden="true"
            />
            <span>{exerciseRecords.exerciseName}</span>
          </CardTitle>
          <CardDescription className="capitalize">
            {exerciseRecords.exerciseCategory}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {exerciseRecords.records.map((record) => (
              <li
                key={record.recordType}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm">
                    {RECORD_TYPE_LABELS[record.recordType]}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatRecordSet(record.set)} ·{" "}
                    {format(new Date(record.achievedAt), "MMM d, yyyy")}
                  </p>
                </div>
                <p className="font-semibold whitespace-nowrap">
                  {formatNumber(record.value)} kg
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </li>
  );
}

export function PersonalRecordCardSkeleton() {
  return (
    <li>
      <Skeleton className="h-[190px] rounded-xl" />
    </li>
  );
}
