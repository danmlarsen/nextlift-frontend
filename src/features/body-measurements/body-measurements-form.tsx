"use client";

import { useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChevronDownIcon } from "lucide-react";

import { MeasurementData } from "@/api/body-measurements/types";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { bodyMeasurementSchema } from "@/validation/bodyMeasurementSchema";

const GIRTH_FIELDS = [
  { name: "neckCm", label: "Neck" },
  { name: "chestCm", label: "Chest" },
  { name: "waistCm", label: "Waist" },
  { name: "hipsCm", label: "Hips" },
  { name: "armCm", label: "Arm" },
  { name: "thighCm", label: "Thigh" },
  { name: "calfCm", label: "Calf" },
] as const;

interface BodyMeasurementFormProps {
  measurementData?: MeasurementData;
  onSubmit: (data: z.infer<typeof bodyMeasurementSchema>) => void;
  onDelete?: () => void;
}

export default function BodyMeasurementsForm({
  onSubmit,
  onDelete,
  measurementData,
}: BodyMeasurementFormProps) {
  const hasGirths = GIRTH_FIELDS.some(
    (girth) => measurementData?.[girth.name] != null,
  );
  const [girthsOpen, setGirthsOpen] = useState(hasGirths);

  const form = useForm({
    resolver: zodResolver(bodyMeasurementSchema),
    defaultValues: {
      date: measurementData?.measuredAt
        ? new Date(measurementData.measuredAt)
        : new Date(),
      weight: measurementData?.weight || "",
      fatPercent: measurementData?.fatPercent ?? "",
      notes: measurementData?.notes ?? "",
      neckCm: measurementData?.neckCm ?? "",
      chestCm: measurementData?.chestCm ?? "",
      waistCm: measurementData?.waistCm ?? "",
      hipsCm: measurementData?.hipsCm ?? "",
      armCm: measurementData?.armCm ?? "",
      thighCm: measurementData?.thighCm ?? "",
      calfCm: measurementData?.calfCm ?? "",
    },
  });

  function handleSubmit(data: z.infer<typeof bodyMeasurementSchema>) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <fieldset className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[100px_1fr]">
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker
                    defaultDate={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="col-start-2" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[100px_1fr]">
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input inputMode="decimal" {...field} />
                </FormControl>
                <FormMessage className="col-start-2" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fatPercent"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[100px_1fr]">
                <FormLabel>Body fat (%)</FormLabel>
                <FormControl>
                  <Input inputMode="decimal" {...field} />
                </FormControl>
                <FormMessage className="col-start-2" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="grid grid-cols-[100px_1fr]">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage className="col-start-2" />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setGirthsOpen((open) => !open)}
              aria-expanded={girthsOpen}
              className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 text-sm font-medium transition-colors"
            >
              <ChevronDownIcon
                aria-hidden="true"
                className={cn(
                  "size-4 transition-transform",
                  !girthsOpen && "-rotate-90",
                )}
              />
              Body measurements (cm)
            </button>

            {girthsOpen && (
              <div className="grid grid-cols-2 gap-4">
                {GIRTH_FIELDS.map((girth) => (
                  <FormField
                    key={girth.name}
                    control={form.control}
                    name={girth.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{girth.label}</FormLabel>
                        <FormControl>
                          <Input inputMode="decimal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {!!measurementData && (
              <Button variant="destructive" type="button" onClick={onDelete}>
                Delete
              </Button>
            )}
            <Button
              type="submit"
              className={cn("col-span-2", !!measurementData && "col-span-1")}
            >
              Save
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
