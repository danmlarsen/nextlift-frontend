import { ExerciseData } from "@/api/exercises/types";
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
  const muscleGroups = [
    ...exercise.targetMuscleGroups,
    ...exercise.secondaryMuscleGroups,
  ];

  return (
    <li className="odd:bg-card even:bg-card/50 rounded-sm p-2">
      <button
        className="grid w-full grid-cols-[50px_1fr_50px] items-center gap-3 text-sm"
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
        <div className="text-xs">{exercise.timesUsed} times</div>
      </button>
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
