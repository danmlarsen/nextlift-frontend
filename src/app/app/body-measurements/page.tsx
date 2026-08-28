import BodyMeasurementList from "@/features/body-measurements/body-measurements-list";
import BodyMeasurementsChart from "@/features/body-measurements/body-measurements-chart";

export default function BodyMeasurementsPage() {
  return (
    <div className="space-y-4">
      <BodyMeasurementsChart />
      <BodyMeasurementList />
    </div>
  );
}
