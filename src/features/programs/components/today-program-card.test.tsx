import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type EnrollmentData } from "@/api/program-enrollments/types";
import TodayProgramCard from "./today-program-card";

const start = vi.fn();
let enrollment: EnrollmentData | null = null;

vi.mock("@/api/program-enrollments/queries", () => ({
  useActiveEnrollment: () => ({ data: enrollment, isLoading: false }),
}));

vi.mock("@/features/programs/hooks/use-start-program-day", () => ({
  useStartProgramDay: () => ({ start, isPending: false }),
}));

const day = {
  position: { cycle: 1, weekIndex: 1, dayIndex: 2 },
  blockIndex: 0,
  weekInBlock: 1,
  dayId: 20,
  dayName: "B1",
  blockName: "Rotation",
  weekLabel: null,
  isDeload: false,
  exercises: [
    {
      programExerciseId: 1,
      progressionKey: "t1-ohp",
      exerciseId: 5,
      exercise: {
        id: 5,
        name: "Overhead Press",
        equipment: "barbell",
        category: "strength",
      },
      strategy: "LINEAR" as const,
      restSeconds: 180,
      notes: null,
      sets: [],
    },
  ],
};

const baseEnrollment = {
  id: 11,
  programId: 3,
  programName: "Tiered Linear Progression",
  status: "ACTIVE",
  snapshot: { durationMode: "OPEN_ENDED", effortScale: "RPE" },
  schedule: {
    mode: "SEQUENCE",
    localDate: "2026-09-07",
    position: { cycle: 1, weekIndex: 1, dayIndex: 2 },
    totalWeeks: 1,
    today: null,
    todayStatus: null,
    next: day,
    nextDate: null,
    weeks: [],
    adherence: {
      planned: 4,
      completed: 1,
      skipped: 0,
      missed: 0,
      plannedElapsed: 1,
    },
  },
} as unknown as EnrollmentData;

describe("TodayProgramCard", () => {
  beforeEach(() => {
    start.mockClear();
    enrollment = null;
  });

  it("renders nothing for users who do not follow a program", () => {
    const { container } = render(<TodayProgramCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the next program day and starts it", async () => {
    enrollment = baseEnrollment;
    const user = userEvent.setup();
    render(<TodayProgramCard />);

    expect(screen.getByText("Next: B1")).toBeInTheDocument();
    expect(screen.getByText("Tiered Linear Progression")).toBeInTheDocument();
    expect(screen.getByText("Week 1 of 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start workout" }));
    expect(start).toHaveBeenCalledWith(11, {
      cycle: 1,
      weekIndex: 1,
      dayIndex: 2,
    });
  });

  it("offers the program page instead of a start button once today is done", () => {
    enrollment = {
      ...baseEnrollment,
      schedule: {
        ...baseEnrollment.schedule,
        mode: "CALENDAR",
        today: day,
        todayStatus: "COMPLETED",
      },
    } as unknown as EnrollmentData;
    render(<TodayProgramCard />);

    expect(screen.getByText("Today: B1")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Start workout" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open program" })).toHaveAttribute(
      "href",
      "/app/programs/active",
    );
  });
});
