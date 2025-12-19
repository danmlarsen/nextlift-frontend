import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client";
import {
  CreateMeasurementDto,
  MeasurementData,
  UpdateMeasurementDto,
} from "./types";

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

export const useEditBodyMeasurement = (measurementId: number) => {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMeasurementDto) =>
      apiClient<MeasurementData>(`/body-measurements/${measurementId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodyMeasurements"] });
      queryClient.invalidateQueries({
        queryKey: ["bodyMeasurement", { id: measurementId }],
      });
    },
  });
};

export const useDeleteBodyMeasurement = (measurementId: number) => {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<MeasurementData>(`/body-measurements/${measurementId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodyMeasurements"] });
      queryClient.removeQueries({
        queryKey: ["bodyMeasurement", { id: measurementId }],
      });
    },
  });
};
