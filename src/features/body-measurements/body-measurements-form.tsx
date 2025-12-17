"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { cn } from "@/lib/utils";
import { bodyMeasurementSchema } from "@/validation/bodyMeasurementSchema";

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
  const form = useForm({
    resolver: zodResolver(bodyMeasurementSchema),
    defaultValues: {
      date: measurementData?.measuredAt
        ? new Date(measurementData.measuredAt)
        : new Date(),
      weight: measurementData?.weight || "",
    },
  });

  console.log(measurementData);

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
                <FormLabel>Weight</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className="col-start-2" />
              </FormItem>
            )}
          />

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
