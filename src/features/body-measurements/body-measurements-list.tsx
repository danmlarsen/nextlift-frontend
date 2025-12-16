"use client";

import { useBodyMeasurements } from "@/api/body-measurements/queries";
import BodyMeasurementsItem, {
  BodyMeasurementsItemSkeleton,
} from "./body-measurements-item";

export default function BodyMeasurementList() {
  const { data, isLoading, isSuccess, isError } = useBodyMeasurements();

  return (
    <ul className="space-y-4">
      {isLoading &&
        Array.from({ length: 5 }).map((_, index) => (
          <BodyMeasurementsItemSkeleton key={`initial-${index}`} />
        ))}
      {isSuccess &&
        data.map((measurement) => (
          <BodyMeasurementsItem
            key={measurement.id}
            measurement={measurement}
          />
        ))}
      {isError && (
        <li className="text-destructive">
          An unexpected error occurred while loading body measurements. Please
          try again later.
        </li>
      )}
    </ul>
  );
}
