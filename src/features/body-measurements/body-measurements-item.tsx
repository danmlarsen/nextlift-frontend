import { formatDate } from "date-fns";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { MeasurementData } from "@/api/body-measurements/types";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface BodyMeasurementItemProps {
  measurement: MeasurementData;
}

export default function BodyMeasurementsItem({
  measurement,
}: BodyMeasurementItemProps) {
  return (
    <li>
      <Link
        href={`/app/body-measurements/edit/${measurement.id}`}
        className="bg-card grid w-full grid-cols-[150px_1fr_auto] gap-4 rounded-lg p-6 text-left"
      >
        <div>{formatDate(measurement.measuredAt, "PP")}</div>
        <div>{formatNumber(measurement.weight)} kg</div>
        <ChevronRightIcon />
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
