"use client";

import { createContext, useContext, useState } from "react";

import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useSearchParamState } from "@/hooks/use-search-param-state";
import WorkoutForm from "../workout-form/workout-form";
import { useWorkout } from "@/api/workouts/queries";
import { parseWorkoutTitle } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  useCompleteWorkout,
  useDeleteWorkout,
  useInvalidateWorkout,
} from "@/api/workouts/workout-mutations";
import CompleteWorkoutDialog from "../workout-active/complete-workout-dialog";
import DeleteActiveWorkoutDialog from "../workout-active/delete-active-workout-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import WorkoutModalHeader from "./workout-modal-header";

interface WorkoutModalProviderContextValue {
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
  const [deleteWorkoutOpen, setDeleteWorkoutOpen] = useState(false);
  const invalidateWorkout = useInvalidateWorkout();
  const {
    data: workout,
    isSuccess,
    isLoading,
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
      value={{ openWorkout, closeWorkout, toggleEdit, isEditing }}
    >
      {children}

      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={closeWorkout}
        content={
          <>
            {workoutId && isLoading && (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            )}
            {isSuccess && workout && (
              <div className="grid h-[calc(100dvh-50px)] grid-rows-[auto_1fr]">
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
