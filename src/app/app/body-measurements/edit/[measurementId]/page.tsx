"use client";

import {
  useDeleteBodyMeasurement,
  useEditBodyMeasurement,
} from "@/api/body-measurements/mutations";
import { useBodyMeasurement } from "@/api/body-measurements/queries";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BodyMeasurementForm from "@/features/body-measurements/body-measurements-form";
import { bodyMeasurementSchema } from "@/validation/bodyMeasurementSchema";
import { useParams, useRouter } from "next/navigation";
import z from "zod";

export default function EditBodyMeasurementsPage() {
  const params = useParams();
  const router = useRouter();
  const measurementId = Number(params.measurementId);

  const { data, isLoading, isSuccess, isError } = useBodyMeasurement(
    !isNaN(measurementId) ? measurementId : undefined,
  );
  const editBodyMeasurementMutation = useEditBodyMeasurement(measurementId);
  const deleteBodyMeasurementMutation = useDeleteBodyMeasurement(measurementId);

  const handleSubmit = (data: z.infer<typeof bodyMeasurementSchema>) => {
    editBodyMeasurementMutation.mutate(
      {
        measuredAt: data.date.toISOString(),
        weight: data.weight,
      },
      {
        onSuccess: () => {
          router.push("/app/body-measurements");
        },
      },
    );
  };

  const handleDelete = () => {
    deleteBodyMeasurementMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace("/app/body-measurements");
      },
    });
  };

  if (isLoading) return <Skeleton className="h-[200px] rounded-lg" />;

  return (
    <Card>
      <div className="px-4">
        {isSuccess && !!data && (
          <BodyMeasurementForm
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            measurementData={data}
          />
        )}
        {isError && (
          <p>
            An unexpected error occurred while loading body measurements. Please
            try again later.
          </p>
        )}
      </div>
    </Card>
  );
}
