"use client";

import { useExercise } from "@/api/exercises/queries";
import ExerciseWorkoutsList from "./exercise-workouts-list";
import ExerciseCharts from "./exercise-charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getYouTubeEmbedUrl } from "@/lib/utils";

interface ExerciseDetailsProps {
  exerciseId: number;
  scrollParentRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ExerciseDetails({
  exerciseId,
  scrollParentRef,
}: ExerciseDetailsProps) {
  const { data } = useExercise(exerciseId);

  const video =
    data?.videoUrls && data?.videoUrls.length > 0 ? data?.videoUrls[0] : null;

  return (
    <div className="space-y-4">
      {data && (
        <>
          <h2 className="text-center text-xl">{data.name}</h2>
          <Tabs defaultValue="workouts">
            <TabsList className="w-full rounded-none">
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
            </TabsList>
            <div className="px-4">
              <TabsContent value="instructions">
                {!!video && (
                  <div className="mx-auto aspect-[9/16] max-w-lg overflow-hidden rounded-lg">
                    <iframe
                      src={getYouTubeEmbedUrl(video)}
                      title={`${data.name} - Exercise Demo`}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {!video && (
                  <p className="text-muted-foreground text-center">
                    No instructions for this exercise found
                  </p>
                )}
              </TabsContent>
              <TabsContent value="workouts">
                {data && (
                  <ExerciseWorkoutsList
                    exercise={data}
                    scrollParentRef={scrollParentRef}
                  />
                )}
              </TabsContent>
              <TabsContent value="charts">
                <ExerciseCharts exerciseId={exerciseId} />
              </TabsContent>
            </div>
          </Tabs>
        </>
      )}
    </div>
  );
}
