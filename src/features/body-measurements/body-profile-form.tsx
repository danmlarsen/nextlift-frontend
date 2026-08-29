"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { type UserProfileData } from "@/api/user-profile/types";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { userProfileSchema } from "@/validation/userProfileSchema";

const SEX_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
] as const;

const ACTIVITY_OPTIONS = [
  { value: "SEDENTARY", label: "Sedentary", hint: "little exercise" },
  { value: "LIGHT", label: "Light", hint: "1–3 sessions/week" },
  { value: "MODERATE", label: "Moderate", hint: "3–5 sessions/week" },
  { value: "ACTIVE", label: "Active", hint: "6–7 sessions/week" },
  { value: "VERY_ACTIVE", label: "Very active", hint: "hard daily training" },
] as const;

const GOAL_OPTIONS = [
  { value: "LOSE", label: "Lose weight" },
  { value: "MAINTAIN", label: "Maintain" },
  { value: "GAIN", label: "Gain weight" },
] as const;

interface BodyProfileFormProps {
  profile: UserProfileData | null;
  onSubmit: (data: z.infer<typeof userProfileSchema>) => void;
  isPending?: boolean;
}

export default function BodyProfileForm({
  profile,
  onSubmit,
  isPending,
}: BodyProfileFormProps) {
  const form = useForm({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      heightCm: profile?.heightCm ?? "",
      birthDate: profile?.birthDate ? new Date(profile.birthDate) : undefined,
      sex: profile?.sex ?? undefined,
      activityLevel: profile?.activityLevel ?? undefined,
      goalWeight: profile?.goalWeight ?? "",
      weightGoal: profile?.weightGoal ?? undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className="space-y-6" disabled={isPending}>
          <FormField
            control={form.control}
            name="heightCm"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[120px_1fr]">
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input inputMode="decimal" {...field} />
                </FormControl>
                <FormMessage className="col-start-2" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[120px_1fr]">
                <FormLabel>Birth date</FormLabel>
                <FormControl>
                  <DatePicker
                    defaultDate={field.value}
                    onChange={field.onChange}
                    captionLayout="dropdown"
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date()}
                  />
                </FormControl>
                <FormMessage className="col-start-2" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sex</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-6"
                  >
                    {SEX_OPTIONS.map((option) => (
                      <FormItem
                        key={option.value}
                        className="flex items-center gap-2"
                      >
                        <FormControl>
                          <RadioGroupItem value={option.value} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity level</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="gap-2"
                  >
                    {ACTIVITY_OPTIONS.map((option) => (
                      <FormItem
                        key={option.value}
                        className="flex items-center gap-2"
                      >
                        <FormControl>
                          <RadioGroupItem value={option.value} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({option.hint})
                          </span>
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goalWeight"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[120px_1fr]">
                <FormLabel>Goal weight (kg)</FormLabel>
                <FormControl>
                  <Input inputMode="decimal" {...field} />
                </FormControl>
                <FormMessage className="col-start-2" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weightGoal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal direction</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-wrap gap-6"
                  >
                    {GOAL_OPTIONS.map((option) => (
                      <FormItem
                        key={option.value}
                        className="flex items-center gap-2"
                      >
                        <FormControl>
                          <RadioGroupItem value={option.value} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {isPending ? "Saving…" : "Save"}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
