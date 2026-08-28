import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type WeeklyReportData } from "@/api/workouts/types";
import WeeklyReport from "./weekly-report";

const useWeeklyReportMock = vi.fn();

vi.mock("@/api/workouts/queries", () => ({
  useWeeklyReport: (weekStart: Date) => useWeeklyReportMock(weekStart),
}));

const report: WeeklyReportData = {
  totalWorkouts: 4,
  totalMinutes: 215,
  totalWeightLifted: 12500,
  weekStreak: 6,
  muscles: [{ muscleGroup: "chest", score: 12, sets: 12 }],
};

describe("WeeklyReport", () => {
  it("renders the four stat cards", () => {
    useWeeklyReportMock.mockReturnValue({
      data: report,
      isLoading: false,
      isError: false,
      isSuccess: true,
    });
    render(<WeeklyReport />);

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Workouts")).toBeInTheDocument();
    expect(screen.getByText("215")).toBeInTheDocument();
    expect(screen.getByText("Minutes")).toBeInTheDocument();
    expect(screen.getByText("Lifted")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Week streak")).toBeInTheDocument();
  });

  it("renders the empty state for a week without workouts", () => {
    useWeeklyReportMock.mockReturnValue({
      data: { ...report, totalWorkouts: 0, muscles: [] },
      isLoading: false,
      isError: false,
      isSuccess: true,
    });
    render(<WeeklyReport />);

    expect(screen.getByText("No workouts this week.")).toBeInTheDocument();
  });

  it("renders an error message when the request fails", () => {
    useWeeklyReportMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isSuccess: false,
    });
    render(<WeeklyReport />);

    expect(
      screen.getByText("Failed to load weekly report."),
    ).toBeInTheDocument();
  });

  it("requests the last completed week by default", () => {
    useWeeklyReportMock.mockReturnValue({
      data: report,
      isLoading: false,
      isError: false,
      isSuccess: true,
    });
    render(<WeeklyReport />);

    const weekStart = useWeeklyReportMock.mock.calls[0][0] as Date;
    expect(weekStart.getDay()).toBe(1); // Monday
    expect(weekStart.getHours()).toBe(0);
    expect(weekStart.getTime()).toBeLessThan(Date.now());
  });
});
