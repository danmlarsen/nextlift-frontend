import { format } from "date-fns";
import Link from "next/link";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  StickyNoteIcon,
} from "lucide-react";

import { MeasurementData } from "@/api/body-measurements/types";
import { type WeightGoal } from "@/api/user-profile/types";
import { cn, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface BodyMeasurementItemProps {
  measurement: MeasurementData;
  previousMeasurement?: MeasurementData;
  /** Colors the delta arrow by whether the change moves toward the goal. */
  weightGoal?: WeightGoal | null;
}

export default function BodyMeasurementsItem({
  measurement,
  previousMeasurement,
  weightGoal,
}: BodyMeasurementItemProps) {
  const change = previousMeasurement
    ? measurement.weight - previousMeasurement.weight
    : 0;
  const increased = change > 0;
  // Without a stated goal direction there is no good or bad change.
  const deltaColor =
    !weightGoal || weightGoal === "MAINTAIN"
      ? "text-muted-foreground"
      : increased === (weightGoal === "GAIN")
        ? "text-green-500"
        : "text-red-500";
  const DeltaIcon = increased ? ChevronUpIcon : ChevronDownIcon;

  return (
    <li>
      <Link
        href={`/app/body-measurements/edit/${measurement.id}`}
        className="bg-card hover:bg-card/50 grid w-full grid-cols-[100px_1fr_auto] gap-4 rounded-lg p-6 text-left text-sm transition-colors duration-300"
      >
        <div>{format(new Date(measurement.measuredAt), "PP")}</div>
        <div className="flex items-center gap-2">
          <div>{formatNumber(measurement.weight)} kg</div>
          {!!previousMeasurement && change !== 0 && (
            <div className="text-muted-foreground flex items-center text-xs">
              <DeltaIcon className={cn("size-3", deltaColor)} />
              <p>{formatNumber(Math.abs(change))}kg</p>
            </div>
          )}
          {measurement.fatPercent != null && (
            <div className="text-muted-foreground text-xs">
              {formatNumber(measurement.fatPercent)}% fat
            </div>
          )}
          {!!measurement.notes && (
            <StickyNoteIcon
              aria-label="Has notes"
              className="text-muted-foreground size-3"
            />
          )}
        </div>
        <ChevronRightIcon aria-hidden="true" />
      </Link>
    </li>
  );
}

export function BodyMeasurementsItemSkeleton() {
  return (
    <li>
      <Skeleton className="h-[72px] rounded-lg" />
    </li>
  );
}
