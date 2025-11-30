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
import { Textarea } from "@/components/ui/textarea";
import { notesSchema } from "@/validation/notesSchema";

interface WorkoutNotesDialogProps {
  notes: string | null;
  isOpen: boolean;
  onOpenChange: (newState: boolean) => void;
  onConfirm: (newNotes: string) => void;
}

export default function WorkoutNotesDialog({
  notes,
  isOpen,
  onOpenChange,
  onConfirm,
}: WorkoutNotesDialogProps) {
  const form = useForm<z.infer<typeof notesSchema>>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: notes || "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof notesSchema>) => {
    onConfirm(data.notes);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Workout Note</DialogTitle>
          <DialogDescription>
            You can add notes to your workout to remember important details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Notes</FormLabel>
                  <FormMessage />
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please enter your notes here..."
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4 grid grid-cols-2">
              <DialogClose>Cancel</DialogClose>
              <Button type="submit">OK</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
