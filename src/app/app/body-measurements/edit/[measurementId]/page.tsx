"use client";

import {
  useDeleteBodyMeasurement,
  useEditBodyMeasurement,
} from "@/api/body-measurements/mutations";
import { useBodyMeasurement } from "@/api/body-measurements/queries";
import { Card } from "@/components/ui/card";
import BodyMeasurementForm from "@/features/body-measurements/body-measurement-form";
import { bodyMeasurementSchema } from "@/validation/bodyMeasurementSchema";
import { useParams, useRouter } from "next/navigation";
import z from "zod";

export default function EditBodyMeasurementPage() {
  const params = useParams();
  const router = useRouter();
  const measurementId = Number(params.measurementId);

  const { data } = useBodyMeasurement(
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
        router.push("/app/body-measurements");
      },
    });
  };

  if (!data) return null;

  return (
    <Card>
      <div className="px-4">
        <BodyMeasurementForm
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          measurementData={data}
        />
      </div>
    </Card>
  );
}
