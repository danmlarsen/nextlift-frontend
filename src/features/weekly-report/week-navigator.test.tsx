import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import WeekNavigator from "./week-navigator";

const weekStart = new Date(2026, 7, 17); // Monday, Aug 17 2026

describe("WeekNavigator", () => {
  it("shows the week's date range", () => {
    render(
      <WeekNavigator
        weekStart={weekStart}
        isCurrentWeek={false}
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    expect(screen.getByText("Aug 17 - Aug 23")).toBeInTheDocument();
    expect(screen.queryByText("In progress")).not.toBeInTheDocument();
  });

  it("disables the next arrow and shows a hint on the current week", () => {
    render(
      <WeekNavigator
        weekStart={weekStart}
        isCurrentWeek={true}
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Next week" })).toBeDisabled();
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("fires the navigation callbacks", async () => {
    const user = userEvent.setup();
    const onPreviousWeek = vi.fn();
    const onNextWeek = vi.fn();
    render(
      <WeekNavigator
        weekStart={weekStart}
        isCurrentWeek={false}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Previous week" }));
    expect(onPreviousWeek).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(onNextWeek).toHaveBeenCalledOnce();
  });
});
