import { Card } from "@/components/ui/card";
import BodyMeasurementForm from "@/features/body-measurements/body-measurement-form";

export default function AddBodyMeasurementPage() {
  return (
    <Card className="max-w-lg">
      <div className="px-4">
        <BodyMeasurementForm />
      </div>
    </Card>
  );
}
