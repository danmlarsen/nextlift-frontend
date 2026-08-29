"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useActiveWorkout } from "@/api/workouts/queries";
import { useWorkoutModal } from "./workout-modal/workout-modal-provider";
import { useHaptics } from "@/hooks/use-haptics";
import StartWorkoutOptionsModal from "./start-workout-options-modal";

export default function NewActiveWorkoutButton() {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const { data: activeWorkout } = useActiveWorkout();
  const { openWorkout } = useWorkoutModal();
  const { vibrate } = useHaptics();

  const handleClick = () => {
    vibrate();

    if (activeWorkout) {
      openWorkout(activeWorkout.id);
    } else {
      setOptionsOpen(true);
    }
  };

  return (
    <>
      <StartWorkoutOptionsModal
        isOpen={optionsOpen}
        onOpenChange={setOptionsOpen}
      />
      <Button onClick={handleClick} className="w-full">
        {activeWorkout ? "Go to active workout" : "Start new Workout"}
      </Button>
    </>
  );
}
