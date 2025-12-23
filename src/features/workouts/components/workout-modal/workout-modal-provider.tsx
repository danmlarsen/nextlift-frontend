"use client";

import { createContext, useContext, useState } from "react";

import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import WorkoutForm from "./workout-modal-body";
import { useWorkout } from "@/api/workouts/queries";
import { cn, parseWorkoutTitle, summarizeWorkout } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  useCompleteWorkout,
  useDeleteWorkout,
  useInvalidateWorkout,
} from "@/api/workouts/workout-mutations";
import CompleteWorkoutDialog from "./complete-active-workout-dialog";
import DeleteActiveWorkoutDialog from "./delete-active-workout-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import WorkoutModalHeader from "./workout-modal-header";
import { WorkoutData } from "@/api/workouts/types";
import WorkoutHistoryItem from "../workout-history/workout-history-item";
import { Button } from "@/components/ui/button";

interface WorkoutModalProviderContextValue {
  workout?: WorkoutData;
  openWorkout: (workoutId: number, editing?: boolean) => void;
  closeWorkout: () => void;
  isEditing: boolean;
  toggleEdit: () => void;
}

const WorkoutModalContext =
  createContext<WorkoutModalProviderContextValue | null>(null);

interface WorkoutModalProviderProps {
  children: React.ReactNode;
}

export default function WorkoutModalProvider({
  children,
}: WorkoutModalProviderProps) {
  const [isOpen, setIsOpen] = useSearchParamState("workout-modal");
  const [workoutId, setWorkoutId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [completeWorkoutDialogOpen, setCompleteWorkoutDialogOpen] =
    useState(false);
  const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);
  const [deleteWorkoutOpen, setDeleteWorkoutOpen] = useState(false);
  const invalidateWorkout = useInvalidateWorkout();
  const {
    data: workout,
    isSuccess,
    isLoading,
    isError,
  } = useWorkout(workoutId || undefined);
  const completeWorkout = useCompleteWorkout();
  const deleteWorkout = useDeleteWorkout();
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const workoutTitle = workout ? parseWorkoutTitle(workout) : "Loading...";
  const hasIncompleteSets = workout
    ? workout.workoutExercises?.filter(
        (workoutExercise) =>
          workoutExercise.workoutSets?.filter((set) => !set.completed).length >
          0,
      ).length > 0
    : false;

  const openWorkout = (workoutId: number, editing = true) => {
    setWorkoutId(workoutId);
    setIsEditing(editing);
    setIsOpen(true);
  };

  const closeWorkout = () => {
    setIsOpen(false);
    if (workoutId) {
      invalidateWorkout(workoutId);
    }
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleCompleteWorkout = () => {
    if (!workout) return;
    setCompleteWorkoutDialogOpen(false);

    completeWorkout.mutate(workout.id, {
      onSuccess: () => {
        setShowWorkoutSummary(true);
        closeWorkout();
        queryClient.setQueryData(["activeWorkout"], null);
      },
    });
  };

  const handleSaveWorkout = () => {
    if (!workout) return;
    completeWorkout.mutate(workout.id, {
      onSuccess: () => {
        closeWorkout();
      },
    });
  };

  const handleDeleteWorkout = () => {
    if (!workout) return;
    closeWorkout();
    deleteWorkout.mutate(workout.id, {
      onSuccess: (data) => {
        if (data.status === "ACTIVE") {
          queryClient.removeQueries({ queryKey: ["activeWorkout"] });
        }
      },
    });
  };

  return (
    <WorkoutModalContext.Provider
      value={{ workout, openWorkout, closeWorkout, toggleEdit, isEditing }}
    >
      {children}

      <ResponsiveModal
        isOpen={isOpen && !!workoutId}
        onOpenChange={closeWorkout}
        content={
          <>
            {workoutId && isLoading && (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            )}
            {isError && (
              <div className="text-muted-foreground flex items-center justify-center py-8">
                Error loading workout
              </div>
            )}
            {isSuccess && workout && !showWorkoutSummary && (
              <div
                className={cn(
                  "grid h-[calc(100dvh-42px)] grid-rows-[auto_1fr] pb-4",
                  isDesktop && "h-[100dvh] pt-4",
                )}
              >
                <WorkoutModalHeader
                  workout={workout}
                  onClickComplete={() => setCompleteWorkoutDialogOpen(true)}
                  onClickDelete={() => setDeleteWorkoutOpen(true)}
                  onClickSave={handleSaveWorkout}
                />

                <div className="overflow-y-auto px-4">
                  <WorkoutForm
                    workout={workout}
                    onDelete={() => setDeleteWorkoutOpen(true)}
                    isEditing={isEditing}
                  />
                </div>
              </div>
            )}
          </>
        }
        title={workoutTitle}
        description={`Viewing workout ${workoutTitle}`}
      />

      <ResponsiveModal
        isOpen={showWorkoutSummary && !!workout}
        onOpenChange={setShowWorkoutSummary}
        content={
          workout && (
            <div className="grid grid-rows-[auto_1fr_auto] space-y-4 p-4 text-center">
              <div>
                <p>Workout Completed!</p>
              </div>
              <div>
                <WorkoutHistoryItem
                  workout={summarizeWorkout(workout)}
                  interactable={false}
                />
              </div>
              <div>
                <Button
                  className="w-full"
                  onClick={() => setShowWorkoutSummary(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )
        }
      />

      <CompleteWorkoutDialog
        open={completeWorkoutDialogOpen}
        onOpenChange={setCompleteWorkoutDialogOpen}
        onConfirm={handleCompleteWorkout}
        incomplete={hasIncompleteSets}
      />

      <DeleteActiveWorkoutDialog
        isOpen={deleteWorkoutOpen}
        onOpenChanged={setDeleteWorkoutOpen}
        onConfirm={handleDeleteWorkout}
      />
    </WorkoutModalContext.Provider>
  );
}

export const useWorkoutModal = () => {
  const context = useContext(WorkoutModalContext);
  if (!context) {
    throw new Error("useWorkoutModal must be used within WorkoutModalProvider");
  }
  return context;
};
