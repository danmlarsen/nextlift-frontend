"use client";

import {
  usePrefetchAdjacentMonths,
  useWorkoutCalendar,
} from "@/api/workouts/queries";
import { Calendar } from "@/components/ui/workout-calendar";
import { addWeeks, endOfMonth, startOfMonth, subWeeks } from "date-fns";
import { useState } from "react";

interface WorkoutHistoryCalendarProps {
  selectedDate: Date | undefined;
  setSelectedDate: (value: Date | undefined) => void;
}

export default function WorkoutHistoryCalendar({
  selectedDate,
  setSelectedDate,
}: WorkoutHistoryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const from = subWeeks(startOfMonth(currentDate), 1);
  const to = addWeeks(endOfMonth(currentDate), 1);

  const { data: calendarData } = useWorkoutCalendar(from, to);
  usePrefetchAdjacentMonths(currentDate);

  const workoutDates = calendarData
    ? calendarData.workoutDates.map((str) => new Date(str))
    : [];

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      modifiers={{
        workout: workoutDates,
      }}
      className="w-full rounded-md border shadow-sm"
      captionLayout="label"
      onPrevClick={(date) => setCurrentDate(date)}
      onNextClick={(date) => setCurrentDate(date)}
    />
  );
}
