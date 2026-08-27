import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import WorkoutExerciseOptionsButton from "./workout-exercise-options-button";

describe("WorkoutExerciseOptionsButton", () => {
  it("allows favorite changes while hiding edit actions in completed workouts", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    render(
      <WorkoutExerciseOptionsButton
        canEdit={false}
        isFavorite
        favoriteDisabled={false}
        onToggleFavorite={onToggleFavorite}
        onOpenNotes={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Exercise options" }));
    await user.click(
      screen.getByRole("menuitem", { name: "Remove from favorites" }),
    );

    expect(onToggleFavorite).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("menuitem", { name: "Add Exercise Notes" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Remove Exercise" }),
    ).not.toBeInTheDocument();
  });

  it("shows workout edit actions while editing", async () => {
    const user = userEvent.setup();
    render(
      <WorkoutExerciseOptionsButton
        canEdit
        isFavorite={false}
        favoriteDisabled={false}
        onToggleFavorite={vi.fn()}
        onOpenNotes={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Exercise options" }));

    expect(
      screen.getByRole("menuitem", { name: "Add to favorites" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Add Exercise Notes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Remove Exercise" }),
    ).toBeInTheDocument();
  });
});
