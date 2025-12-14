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
