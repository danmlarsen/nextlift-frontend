"use client";

import { useWorkoutCalendar } from "@/api/workouts/queries";
import { Calendar } from "@/components/ui/workout-calendar";
import { addWeeks, endOfYear, startOfYear, subWeeks } from "date-fns";

interface WorkoutHistoryCalendarProps {
  selectedDate: Date | undefined;
  setSelectedDate: (value: Date | undefined) => void;
}

export default function WorkoutHistoryCalendar({
  selectedDate,
  setSelectedDate,
}: WorkoutHistoryCalendarProps) {
  const currentDate = selectedDate || new Date();
  const from = subWeeks(startOfYear(currentDate), 1);
  const to = addWeeks(endOfYear(currentDate), 1);
  const { data: calendarData } = useWorkoutCalendar(from, to);
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
    />
  );
}
