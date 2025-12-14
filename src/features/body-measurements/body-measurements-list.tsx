"use client";

import { formatDate } from "date-fns";

import { useBodyMeasurements } from "@/api/body-measurements/queries";

export default function BodyMeasurementList() {
  const { data } = useBodyMeasurements();

  return (
    !!data &&
    data.length > 0 && (
      <ul className="space-y-4">
        {data.map((measurement) => (
          <li
            key={measurement.id}
            className="bg-card grid grid-cols-[auto_1fr_auto] gap-4 rounded-lg p-4"
          >
            <div>{formatDate(measurement.measuredAt, "PP")}</div>
            <div>{measurement.weight}</div>
            <div>link</div>
          </li>
        ))}
      </ul>
    )
  );
}
