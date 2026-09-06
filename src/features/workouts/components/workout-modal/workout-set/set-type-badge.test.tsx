import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SetTypeBadge from "./set-type-badge";

describe("SetTypeBadge", () => {
  it("shows the set number, and a plus for program AMRAP sets", () => {
    const { rerender } = render(<SetTypeBadge type="normal" setNumber={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();

    rerender(<SetTypeBadge type="normal" setNumber={3} amrap />);
    expect(screen.getByText("3+")).toBeInTheDocument();
  });

  it("keeps letters for special set types", () => {
    render(<SetTypeBadge type="warmup" setNumber={1} amrap />);
    expect(screen.getByText("W")).toBeInTheDocument();
  });
});
