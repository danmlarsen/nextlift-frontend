import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../client";
import { UserProfileData } from "./types";

export const useUserProfile = () => {
  const { apiClient } = useApiClient();

  return useQuery<UserProfileData | null>({
    queryKey: ["userProfile"],
    queryFn: () => apiClient<UserProfileData | null>(`/user-profile`),
  });
};
