import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type WeeklyReportMuscle } from "@/api/workouts/types";
import MuscleEngagementCard from "./muscle-engagement-card";

const muscles: WeeklyReportMuscle[] = [
  { muscleGroup: "chest", score: 12, sets: 12 },
  { muscleGroup: "triceps", score: 6, sets: 8 },
  { muscleGroup: "other", score: 4, sets: 4 },
];

describe("MuscleEngagementCard", () => {
  it("colors the max muscle at full intensity and untrained muscles muted", () => {
    const { container } = render(<MuscleEngagementCard muscles={muscles} />);

    // chest is the week's max muscle, so its region renders at full intensity.
    expect(
      container.querySelector('g[fill="var(--chart-1)"][fill-opacity="1"]'),
    ).not.toBeNull();
    // Untrained muscles render in the muted zero state.
    expect(
      container.querySelector('g[fill="var(--muted)"][fill-opacity="0.25"]'),
    ).not.toBeNull();
    // Regions carry hover titles with the set counts.
    const titles = Array.from(container.querySelectorAll("title")).map(
      (title) => title.textContent,
    );
    expect(titles).toContain("chest — 12 sets");
    expect(titles).toContain("quadriceps — 0 sets");
  });

  it("lists muscles that cannot be drawn on the body", () => {
    render(<MuscleEngagementCard muscles={muscles} />);

    expect(screen.getByText(/Also trained:/)).toHaveTextContent("other (4)");
  });

  it("shows an empty state without workouts", () => {
    render(<MuscleEngagementCard muscles={[]} />);

    expect(screen.getByText("No workouts this week.")).toBeInTheDocument();
    expect(screen.queryByText("Top muscles")).not.toBeInTheDocument();
  });
});
