"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  defaultDate?: Date;
  onChange: (newDate: Date) => void;
}

export function DatePicker({ defaultDate, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(defaultDate);

  const handleSetDate = (newDate: Date) => {
    setIsOpen(false);
    setDate(newDate);
    onChange(newDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
          onClick={() => setIsOpen(true)}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSetDate}
          required
        />
      </PopoverContent>
    </Popover>
  );
}
