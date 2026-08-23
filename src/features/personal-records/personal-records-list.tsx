"use client";

import { TrophyIcon } from "lucide-react";

import { usePersonalRecords } from "@/api/personal-records/queries";
import PersonalRecordCard, {
  PersonalRecordCardSkeleton,
} from "./personal-record-card";

export default function PersonalRecordsList() {
  const { data, isLoading, isSuccess, isError } = usePersonalRecords();

  return (
    <ul className="space-y-4">
      {isLoading &&
        Array.from({ length: 5 }).map((_, index) => (
          <PersonalRecordCardSkeleton key={`initial-${index}`} />
        ))}
      {isSuccess &&
        data.map((exerciseRecords) => (
          <PersonalRecordCard
            key={exerciseRecords.exerciseId}
            exerciseRecords={exerciseRecords}
          />
        ))}
      {isSuccess && data.length === 0 && (
        <li className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center">
          <TrophyIcon className="size-8" aria-hidden="true" />
          <p>No records yet — complete a set to earn your first PR.</p>
        </li>
      )}
      {isError && (
        <li className="text-destructive">
          An unexpected error occurred while loading personal records. Please
          try again later.
        </li>
      )}
    </ul>
  );
}
