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
  /**
   * "dropdown" adds month + year selects — use for far-away dates like a
   * birth date, where paging month by month is unusable.
   */
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"];
  /** Earliest navigable month (bounds the year dropdown). */
  startMonth?: Date;
  /** Latest navigable month (bounds the year dropdown). */
  endMonth?: Date;
}

export function DatePicker({
  defaultDate,
  onChange,
  captionLayout,
  startMonth,
  endMonth,
}: DatePickerProps) {
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
          captionLayout={captionLayout}
          startMonth={startMonth}
          endMonth={endMonth}
          defaultMonth={date}
          required
        />
      </PopoverContent>
    </Popover>
  );
}
