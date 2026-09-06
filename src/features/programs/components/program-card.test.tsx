import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ProgramSummaryData } from "@/api/programs/types";
import ProgramCard from "./program-card";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/api/programs/mutations", () => ({
  useDuplicateProgram: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteProgram: () => ({ mutate: vi.fn(), isPending: false }),
}));

const program: ProgramSummaryData = {
  id: 3,
  userId: -1,
  slug: "tiered-linear-3-day",
  version: 1,
  name: "Tiered Linear Progression",
  description: "Four rotating workouts.",
  credit: "Inspired by GZCLP",
  goal: "STRENGTH",
  level: "BEGINNER",
  scheduleMode: "SEQUENCE",
  durationMode: "OPEN_ENDED",
  daysPerWeek: 3,
  effortScale: "RPE",
  visibility: "SYSTEM",
  createdAt: "2026-09-05T00:00:00.000Z",
  updatedAt: "2026-09-05T00:00:00.000Z",
  isOwner: false,
  isSystem: true,
  totalWeeks: 1,
};

describe("ProgramCard", () => {
  it("links to the program and shows level, goal and schedule facts", () => {
    render(<ProgramCard program={program} />);

    expect(
      screen.getByRole("link", { name: "Tiered Linear Progression" }),
    ).toHaveAttribute("href", "/app/programs/3");
    expect(screen.getByLabelText("Level: Beginner")).toBeInTheDocument();
    expect(screen.getByLabelText("Goal: Strength")).toBeInTheDocument();
    expect(
      screen.getByText("3 days/week · Repeating 1-week cycle · Rotation"),
    ).toBeInTheDocument();
    expect(screen.getByText("Inspired by GZCLP")).toBeInTheDocument();
  });

  it("describes fixed-length calendar programs", () => {
    render(
      <ProgramCard
        program={{
          ...program,
          scheduleMode: "CALENDAR",
          durationMode: "FIXED",
          totalWeeks: 12,
          daysPerWeek: 4,
        }}
      />,
    );

    expect(
      screen.getByText("4 days/week · 12 weeks (≈ 3 months) · Fixed weekdays"),
    ).toBeInTheDocument();
  });
});

describe("ProgramCard actions", () => {
  it("offers an actions menu for every program", () => {
    render(<ProgramCard program={program} />);
    expect(
      screen.getByRole("button", { name: "Tiered Linear Progression actions" }),
    ).toBeInTheDocument();
  });
});
