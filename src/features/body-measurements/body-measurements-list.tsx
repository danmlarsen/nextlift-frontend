"use client";

import { formatDate } from "date-fns";

import { useBodyMeasurements } from "@/api/body-measurements/queries";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

export default function BodyMeasurementList() {
  const { data } = useBodyMeasurements();

  return (
    !!data &&
    data.length > 0 && (
      <ul className="space-y-4">
        {data.map((measurement) => (
          <li key={measurement.id}>
            <Link
              href={`/app/body-measurements/edit/${measurement.id}`}
              className="bg-card grid w-full grid-cols-[100px_1fr_auto] gap-4 rounded-lg p-4 text-left"
            >
              <div>{formatDate(measurement.measuredAt, "PP")}</div>
              <div>{measurement.weight}</div>
              <ChevronRightIcon />
            </Link>
          </li>
        ))}
      </ul>
    )
  );
}
