"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { addWeeks, endOfYear, startOfYear, subWeeks } from "date-fns";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Calendar } from "./ui/workout-calendar";
import { useWorkoutCalendar } from "@/api/workouts/queries";

interface DatePickerProps {
  date: Date;
  onDateChanged: (date: Date) => void;
}

export default function DatePicker({ date, onDateChanged }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const currentDate = date || new Date();
  const from = subWeeks(startOfYear(currentDate), 1);
  const to = addWeeks(endOfYear(currentDate), 1);
  const { data: calendarData } = useWorkoutCalendar(from, to);
  const workoutDates = calendarData
    ? calendarData.workoutDates.map((str) => new Date(str))
    : [];

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      onDateChanged(date);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date-picker"
          className="max-w-sm justify-between font-normal"
        >
          {date ? date.toLocaleDateString() : "Select date"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={handleSelectDate}
          modifiers={{
            workout: workoutDates,
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
