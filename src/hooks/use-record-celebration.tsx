"use client";

import { useCallback } from "react";
import { TrophyIcon } from "lucide-react";
import { toast } from "sonner";

import {
  RECORD_TYPE_LABELS,
  type NewRecordData,
} from "@/api/personal-records/types";
import { useHaptics } from "@/hooks/use-haptics";
import { formatNumber } from "@/lib/utils";

export function useRecordCelebration() {
  const { vibrate } = useHaptics();

  return useCallback(
    (newRecords: NewRecordData[]) => {
      if (newRecords.length === 0) return;

      vibrate("success");

      const [first] = newRecords;
      toast.success(
        newRecords.length === 1
          ? `New record: ${first.exerciseName}`
          : `${newRecords.length} new records: ${first.exerciseName}`,
        {
          // One toast per exercise, so rapid set edits replace instead of stack
          id: `personal-record-${first.exerciseId}`,
          icon: <TrophyIcon className="size-4 text-amber-500" />,
          description: newRecords
            .map(
              (record) =>
                `${RECORD_TYPE_LABELS[record.recordType]}: ${formatNumber(record.value)} kg`,
            )
            .join(" · "),
        },
      );
    },
    [vibrate],
  );
}
