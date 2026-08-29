"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { workoutTemplateSchema } from "@/validation/workoutTemplateSchema";

interface TemplateNameDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  defaultName?: string;
  submitLabel?: string;
  isPending?: boolean;
  onSubmit: (name: string) => void;
}

// Callers remount this dialog via a key (like the notes dialog) so the form
// resets whenever it reopens or the default name changes.
export default function TemplateNameDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  defaultName = "",
  submitLabel = "Save",
  isPending = false,
  onSubmit,
}: TemplateNameDialogProps) {
  const form = useForm<z.infer<typeof workoutTemplateSchema>>({
    resolver: zodResolver(workoutTemplateSchema),
    defaultValues: {
      name: defaultName,
    },
  });

  const handleSubmit = (data: z.infer<typeof workoutTemplateSchema>) => {
    onSubmit(data.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Template name</FormLabel>
                  <FormMessage />
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Template name"
                      maxLength={50}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4 grid grid-cols-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
