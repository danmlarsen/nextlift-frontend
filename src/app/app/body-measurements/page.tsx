import BodyMeasurementList from "@/features/body-measurements/body-measurements-list";

export default function BodyMeasurementsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex min-h-12 items-center justify-between">
        <h1 className="text-xl font-bold">Body Measurements</h1>
      </div>
      <BodyMeasurementList />
    </div>
  );
}
