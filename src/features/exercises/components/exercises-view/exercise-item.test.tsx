import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type ExerciseData } from "@/api/exercises/types";
import ExerciseItem from "./exercise-item";

const mutate = vi.fn();

vi.mock("@/api/exercises/mutations", () => ({
  useSetExerciseFavorite: () => ({ mutate, isPending: false }),
}));

const exercise: ExerciseData = {
  id: 7,
  name: "Deadlift",
  userId: null,
  category: "strength",
  targetMuscleGroups: ["back"],
  secondaryMuscleGroups: ["hamstrings"],
  equipment: "barbell",
  instructions: null,
  imageUrls: [],
  videoUrls: [],
  isFavorite: false,
  timesUsed: 4,
};

describe("ExerciseItem", () => {
  beforeEach(() => mutate.mockClear());

  it("favorites an exercise without selecting the row", async () => {
    const user = userEvent.setup();
    const onExerciseClick = vi.fn();
    render(
      <ExerciseItem exercise={exercise} onExerciseClick={onExerciseClick} />,
    );

    await user.click(
      screen.getByRole("button", { name: "Add Deadlift to favorites" }),
    );

    expect(mutate).toHaveBeenCalledWith({ exerciseId: 7, isFavorite: true });
    expect(onExerciseClick).not.toHaveBeenCalled();
  });

  it("exposes the current favorite state accessibly", () => {
    render(
      <ExerciseItem
        exercise={{ ...exercise, isFavorite: true }}
        onExerciseClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Remove Deadlift from favorites",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
