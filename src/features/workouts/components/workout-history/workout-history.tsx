"use client";

import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";

import {
  useCompletedWorkouts,
  useWorkoutLifetimeStats,
} from "@/api/workouts/queries";
import WorkoutHistoryItem, {
  WorkoutHistoryItemSkeleton,
} from "./workout-history-item";
import WorkoutHistoryCalendar from "./workout-history-calendar";
import AddWorkoutButton from "./add-workout-button";
import { WORKOUT_LIST_ITEM_AMOUNT } from "@/lib/constants";

export default function WorkoutHistory() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isSuccess,
    isError,
  } = useCompletedWorkouts(selectedDate);
  const { data: workoutStats } = useWorkoutLifetimeStats();

  return (
    <div className="grid gap-4 sm:grid-cols-[3fr_2fr] sm:gap-8">
      <div className="sm:col-start-2 sm:row-start-1">
        <WorkoutHistoryCalendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </div>
      <div className="space-y-4 sm:col-start-1 sm:row-start-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Workout History{" "}
            {!selectedDate && workoutStats?.totalWorkouts
              ? `(${workoutStats.totalWorkouts})`
              : ""}
          </h2>
          <AddWorkoutButton selectedDate={selectedDate} />
        </div>
        <InfiniteScroll
          initialLoad={false}
          loadMore={() => {
            if (!isFetching) {
              fetchNextPage();
            }
          }}
          hasMore={hasNextPage}
        >
          <ul className="space-y-4 sm:space-y-8">
            {isLoading &&
              Array.from({ length: 2 }).map((_, index) => (
                <WorkoutHistoryItemSkeleton key={`initial-${index}`} />
              ))}
            {isSuccess &&
              data.pages.map((group) =>
                group.data.map((workout) => (
                  <WorkoutHistoryItem key={workout.id} workout={workout} />
                )),
              )}
            {isSuccess &&
              data.pages.length > 0 &&
              data.pages[0].data.length === 0 && (
                <p className="text-muted-foreground">
                  {selectedDate
                    ? `No workout history found for this date.`
                    : "No workout history found."}
                </p>
              )}
            {isFetchingNextPage &&
              Array.from({ length: WORKOUT_LIST_ITEM_AMOUNT }).map(
                (_, index) => (
                  <WorkoutHistoryItemSkeleton key={`loading-more-${index}`} />
                ),
              )}
            {isError && (
              <p className="text-destructive">
                An unexpected error occurred while loading workouts. Please try
                again later.
              </p>
            )}
          </ul>
        </InfiniteScroll>
      </div>
    </div>
  );
}
