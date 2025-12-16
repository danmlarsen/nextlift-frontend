"use client";

import { useAddBodyMeasurement } from "@/api/body-measurements/mutations";
import { Card } from "@/components/ui/card";
import BodyMeasurementForm, {
  bodyMeasurementSchema,
} from "@/features/body-measurements/body-measurement-form";
import { useRouter } from "next/navigation";
import z from "zod";

export default function AddBodyMeasurementPage() {
  const router = useRouter();
  const bodyMeasurementMutation = useAddBodyMeasurement();

  const handleSubmit = (data: z.infer<typeof bodyMeasurementSchema>) => {
    bodyMeasurementMutation.mutate(
      {
        measuredAt: data.date.toISOString(),
        weight: data.weight,
      },
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
