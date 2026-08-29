"use client";

import { useAddBodyMeasurement } from "@/api/body-measurements/mutations";
import { Card } from "@/components/ui/card";
import BodyMeasurementForm from "@/features/body-measurements/body-measurements-form";
import { toMeasurementDto } from "@/features/body-measurements/to-measurement-dto";
import { bodyMeasurementSchema } from "@/validation/bodyMeasurementSchema";
import { useRouter } from "next/navigation";
import z from "zod";

export default function AddBodyMeasurementsPage() {
  const router = useRouter();
  const bodyMeasurementMutation = useAddBodyMeasurement();

  const handleSubmit = (data: z.infer<typeof bodyMeasurementSchema>) => {
    bodyMeasurementMutation.mutate(
      toMeasurementDto(data),
      {
        onSuccess: () => {
          router.push("/app/body-measurements");
        },
        onError: (error) => console.error(error),
      },
    );
  };

  return (
    <Card>
      <div className="px-4">
        <BodyMeasurementForm onSubmit={handleSubmit} />
      </div>
    </Card>
  );
}
