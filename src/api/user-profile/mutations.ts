import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../client";
import { UpsertUserProfileDto, UserProfileData } from "./types";

export const useUpsertUserProfile = () => {
  const { apiClient } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertUserProfileDto) =>
      apiClient<UserProfileData>("/user-profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};
