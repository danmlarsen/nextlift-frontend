"use client";

import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";

import { useInfiniteExercises } from "@/api/exercises/queries";
import {
  ExerciseData,
  type ExercisesQueryFilters,
} from "@/api/exercises/types";
import ExerciseItem, { ExerciseItemSkeleton } from "./exercise-item";
import ExerciseDetailsModal from "../../../../features/exercises/components/exercise-details/exercise-details-modal";
import { EXERCISE_LIST_ITEM_AMOUNT } from "@/lib/constants";
import { useSearchParamState } from "@/hooks/use-search-param-state";

interface ExercisesListProps {
  filters?: ExercisesQueryFilters;
  onExerciseClick?: (id: number) => void;
}

export default function ExercisesList({
  filters,
  onExerciseClick,
}: ExercisesListProps) {
  const [selectedExercise, setSelectedExercise] = useState<
    ExerciseData | undefined
  >();
  const [exerciseDetailsModal, setExerciseDetailsModal] = useSearchParamState(
    "exercise-details-modal",
  );
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isSuccess,
    isError,
  } = useInfiniteExercises({
    filters,
  });

  const handleExerciseClick = (exercise: ExerciseData) => {
    if (onExerciseClick) {
      onExerciseClick(exercise.id);
    } else {
      setSelectedExercise(exercise);
      setExerciseDetailsModal(true);
    }
  };

  return (
    <>
      <ExerciseDetailsModal
        isOpen={exerciseDetailsModal}
        onOpenChange={setExerciseDetailsModal}
        exercise={selectedExercise}
      />

      <InfiniteScroll
        initialLoad={false}
        loadMore={() => {
          if (!isFetching) {
            fetchNextPage();
          }
        }}
        hasMore={hasNextPage}
        useWindow={!onExerciseClick} // Set to false if used in a drawer/modal
      >
        <ul>
          {isLoading &&
            Array.from({ length: EXERCISE_LIST_ITEM_AMOUNT }).map(
              (_, index) => <ExerciseItemSkeleton key={`initial-${index}`} />,
            )}
          {isSuccess &&
            data.pages.map((group) =>
              group.data.map((exercise) => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  onExerciseClick={() => handleExerciseClick(exercise)}
                />
              )),
            )}
          {isFetchingNextPage &&
            Array.from({ length: EXERCISE_LIST_ITEM_AMOUNT }).map(
              (_, index) => (
                <ExerciseItemSkeleton key={`loading-more-${index}`} />
              ),
            )}
          {isError && (
            <p className="text-destructive">
              An unexpected error occurred while loading exercises. Please try
              again later.
            </p>
          )}
        </ul>
      </InfiniteScroll>
    </>
  );
}
