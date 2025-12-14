"use client";

import { useBodyMeasurement } from "@/api/body-measurements/queries";
import { Card } from "@/components/ui/card";
import BodyMeasurementForm, {
  bodyMeasurementSchema,
} from "@/features/body-measurements/body-measurement-form";
import { useParams } from "next/navigation";
import z from "zod";

export default function EditBodyMeasurementPage() {
  const params = useParams();
  const measurementId = Number(params.measurementId);

  const { data } = useBodyMeasurement(
    !isNaN(measurementId) ? measurementId : undefined,
  );

  const handleSubmit = (data: z.infer<typeof bodyMeasurementSchema>) => {
    console.log(data);
  };

  if (!data) return null;

  return (
    <Card className="max-w-lg">
      <div className="px-4">
        <BodyMeasurementForm
          onSubmit={handleSubmit}
          onDelete={() => console.log("delete")}
          measurementData={data}
        />
      </div>
    </Card>
  );
}
