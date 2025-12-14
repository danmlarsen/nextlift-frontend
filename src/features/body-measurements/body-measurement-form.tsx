"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

interface BodyMeasurementFormProps {
  onSubmit: (data: z.infer<typeof bodyMeasurementSchema>) => void;
}

const bodyMeasurementSchema = z.object({
  date: z.date(),
  weight: z.string(),
});

export default function BodyMeasurementForm({
  onSubmit,
}: BodyMeasurementFormProps) {
  const form = useForm<z.infer<typeof bodyMeasurementSchema>>({
    resolver: zodResolver(bodyMeasurementSchema),
    defaultValues: {
      date: new Date(),
      weight: "",
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
                <FormMessage />
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
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-4 w-full">
            OK
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
