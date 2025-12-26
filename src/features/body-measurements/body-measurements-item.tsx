import { format } from "date-fns";
import Link from "next/link";
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from "lucide-react";

import { MeasurementData } from "@/api/body-measurements/types";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface BodyMeasurementItemProps {
  measurement: MeasurementData;
  previousMeasurement?: MeasurementData;
}

export default function BodyMeasurementsItem({
  measurement,
  previousMeasurement,
}: BodyMeasurementItemProps) {
  return (
    <li>
      <Link
        href={`/app/body-measurements/edit/${measurement.id}`}
        className="bg-card hover:bg-card/50 grid w-full grid-cols-[100px_1fr_auto] gap-4 rounded-lg p-6 text-left text-sm transition-colors duration-300"
      >
        <div>{format(new Date(measurement.measuredAt), "PP")}</div>
        <div className="flex items-center gap-2">
          <div>{formatNumber(measurement.weight)} kg</div>
          {previousMeasurement &&
            previousMeasurement.weight < measurement.weight && (
              <div className="text-muted-foreground flex items-center text-xs">
                <ChevronUpIcon className="size-3 text-red-500" />
                <p>
                  {formatNumber(
                    measurement.weight - previousMeasurement.weight,
                  )}
                  kg
                </p>
              </div>
            )}
          {previousMeasurement &&
            previousMeasurement.weight > measurement.weight && (
              <div className="text-muted-foreground flex items-center text-xs">
                <ChevronDownIcon className="size-3 text-green-500" />
                <p>
                  {formatNumber(
                    previousMeasurement.weight - measurement.weight,
                  )}
                  kg
                </p>
              </div>
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
