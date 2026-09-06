"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import {
  type ExerciseData,
  type ExercisesQueryFilters,
} from "@/api/exercises/types";
import { type TEquipment, type TMuscleGroup } from "@/lib/constants";
import ExercisesFilters from "./exercises-filters";
import ExercisesList from "./exercises-list";

interface ExercisesViewProps {
  onExerciseClick?: (id: number, exercise: ExerciseData) => void;
}

export default function ExercisesView({ onExerciseClick }: ExercisesViewProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<
    TMuscleGroup[]
  >([]);
  const [selectedEquipment, setSelectedEquipment] = useState<TEquipment[]>([]);

  const [debouncedName] = useDebounce(nameFilter, 300);

  const filters = useMemo((): ExercisesQueryFilters => {
    const result: ExercisesQueryFilters = {};

    if (debouncedName.trim()) result.name = debouncedName.trim();
    if (selectedEquipment.length > 0) result.equipment = selectedEquipment;
    if (selectedMuscleGroups.length > 0)
      result.targetMuscleGroups = selectedMuscleGroups;

    return result;
  }, [debouncedName, selectedEquipment, selectedMuscleGroups]);

  return (
    <>
      <ExercisesFilters
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        selectedMuscleGroups={selectedMuscleGroups}
        onMuscleGroupsChange={setSelectedMuscleGroups}
        selectedEquipment={selectedEquipment}
        onEquipmentChange={setSelectedEquipment}
      />
      <ExercisesList filters={filters} onExerciseClick={onExerciseClick} />
    </>
  );
}
