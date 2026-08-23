"use client";

import { TrophyIcon } from "lucide-react";

import { useWorkoutRecords } from "@/api/personal-records/queries";
import { RECORD_TYPE_LABELS } from "@/api/personal-records/types";
import { formatNumber } from "@/lib/utils";

interface WorkoutRecordsSummaryProps {
  workoutId: number;
}

export default function WorkoutRecordsSummary({
  workoutId,
}: WorkoutRecordsSummaryProps) {
  const { data, isSuccess } = useWorkoutRecords(workoutId);

  if (!isSuccess || data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-center gap-2 font-semibold">
        <TrophyIcon className="size-4 text-amber-500" aria-hidden="true" />
        <p>New records!</p>
      </div>
      <ul className="text-muted-foreground space-y-1 text-sm">
        {data.flatMap((exerciseRecords) =>
          exerciseRecords.records.map((record) => (
            <li key={`${exerciseRecords.exerciseId}-${record.recordType}`}>
              {exerciseRecords.exerciseName} —{" "}
              {RECORD_TYPE_LABELS[record.recordType]}:{" "}
              {formatNumber(record.value)} kg
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
