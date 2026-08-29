"use client";

import { useRouter } from "next/navigation";
import z from "zod";

import { useUpsertUserProfile } from "@/api/user-profile/mutations";
import { useUserProfile } from "@/api/user-profile/queries";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BodyProfileForm from "@/features/body-measurements/body-profile-form";
import { userProfileSchema } from "@/validation/userProfileSchema";

export default function BodyProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useUserProfile();
  const upsertMutation = useUpsertUserProfile();

  const handleSubmit = (data: z.infer<typeof userProfileSchema>) => {
    upsertMutation.mutate(
      {
        heightCm: data.heightCm ?? null,
        // Normalize to UTC midnight so the stored date can't shift a day
        // for users east of Greenwich.
        birthDate: data.birthDate
          ? new Date(
              Date.UTC(
                data.birthDate.getFullYear(),
                data.birthDate.getMonth(),
                data.birthDate.getDate(),
              ),
            ).toISOString()
          : null,
        sex: data.sex ?? null,
        activityLevel: data.activityLevel ?? null,
        goalWeight: data.goalWeight ?? null,
        weightGoal: data.weightGoal ?? null,
      },
      {
        onSuccess: () => {
          router.push("/app/body-measurements");
        },
        onError: (error) => console.error(error),
      },
    );
  };

  if (isLoading) return <Skeleton className="h-[400px] rounded-lg" />;

  if (isError) {
    return (
      <p>
        An unexpected error occurred while loading your body profile. Please
        try again later.
      </p>
    );
  }

  return (
    <Card>
      <div className="px-4">
        <BodyProfileForm
          profile={profile ?? null}
          onSubmit={handleSubmit}
          isPending={upsertMutation.isPending}
        />
      </div>
    </Card>
  );
}
