import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../client";
import { MeasurementData } from "./types";

export const useBodyMeasurements = () => {
  const { apiClient } = useApiClient();

  return useQuery<MeasurementData[]>({
    queryKey: ["bodyMeasurements"],
    queryFn: () => apiClient<MeasurementData[]>(`/body-measurements`),
  });
};

export const useBodyMeasurement = (measurementId?: number) => {
  const { apiClient } = useApiClient();

  return useQuery<MeasurementData>({
    queryKey: ["bodyMeasurement", { id: measurementId }],
    queryFn: () =>
      apiClient<MeasurementData>(`/body-measurements/${measurementId}`),
    enabled: !!measurementId,
  });
};
