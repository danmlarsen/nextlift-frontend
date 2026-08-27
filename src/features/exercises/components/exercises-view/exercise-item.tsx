"use client";

import { StarIcon } from "lucide-react";

import { useSetExerciseFavorite } from "@/api/exercises/mutations";
import { type ExerciseData } from "@/api/exercises/types";
import { Button } from "@/components/ui/button";
import ExerciseAvatar from "@/components/ui/exercise-avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ExerciseItemProps {
  exercise: ExerciseData;
  onExerciseClick: (id: number) => void;
}

export default function ExerciseItem({
  exercise,
  onExerciseClick,
}: ExerciseItemProps) {
  const setFavorite = useSetExerciseFavorite();
  const muscleGroups = [
    ...exercise.targetMuscleGroups,
    ...exercise.secondaryMuscleGroups,
  ];

  return (
    <li className="odd:bg-card even:bg-card/50 flex items-center rounded-sm p-2">
      <button
        className="grid min-w-0 flex-1 grid-cols-[50px_1fr_auto] items-center gap-3 text-sm"
        onClick={() => onExerciseClick(exercise.id)}
      >
        <div>
          <ExerciseAvatar name={exercise.name} />
        </div>
        <div className="text-left">
          <h2 className="font-bold">{exercise.name}</h2>
          <p className="text-muted-foreground text-xs capitalize">
            {exercise.equipment}
          </p>
          <div className="text-muted-foreground text-[0.6rem] capitalize">
            {muscleGroups.map((muscleGroup, idx) => (
              <span key={`${muscleGroup}_${idx}`}>
                {muscleGroup}
                {idx + 1 !== muscleGroups.length ? ", " : " "}
              </span>
            ))}
          </div>
        </div>
        <div className="text-xs whitespace-nowrap">
          {exercise.timesUsed} {exercise.timesUsed === 1 ? "time" : "times"}
        </div>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="ml-1 shrink-0"
        aria-label={
          exercise.isFavorite
            ? `Remove ${exercise.name} from favorites`
            : `Add ${exercise.name} to favorites`
        }
        aria-pressed={exercise.isFavorite}
        title={
          exercise.isFavorite ? "Remove from favorites" : "Add to favorites"
        }
        disabled={setFavorite.isPending}
        onClick={() =>
          setFavorite.mutate({
            exerciseId: exercise.id,
            isFavorite: !exercise.isFavorite,
          })
        }
      >
        <StarIcon
          className={
            exercise.isFavorite
              ? "fill-amber-400 text-amber-500"
              : "text-muted-foreground"
          }
        />
      </Button>
    </li>
  );
}

export function ExerciseItemSkeleton() {
  return (
    <li className="grid h-26 w-full grid-cols-[75px_1fr] gap-2 py-4">
      <Skeleton className="rounded-xl" />
      <Skeleton className="rounded-xl" />
    </li>
  );
}
