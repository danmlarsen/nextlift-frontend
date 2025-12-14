import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client";
import { CreateMeasurementDto, MeasurementData } from "./types";

export const useAddBodyMeasurement = () => {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeasurementDto) =>
      apiClient<MeasurementData>("/body-measurements", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodyMeasurements"] });
    },
  });
};
