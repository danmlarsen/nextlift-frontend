import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import StrategyParamsForm from "./strategy-params-form";

describe("StrategyParamsForm", () => {
  it("switches strategy with sensible defaults", async () => {
    const user = userEvent.setup();
    const onStrategyChange = vi.fn();
    render(
      <StrategyParamsForm
        idPrefix="t"
        strategy="LINEAR"
        params={{ strategy: "LINEAR", incrementKg: 2.5 }}
        onStrategyChange={onStrategyChange}
        onParamsChange={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText("Progression"),
      "PERCENT_TM",
    );

    expect(onStrategyChange).toHaveBeenCalledWith("PERCENT_TM", {
      strategy: "PERCENT_TM",
      tmPercentOf1RM: 90,
      tmIncrementKg: 2.5,
      tmAdvance: "CYCLE_END",
    });
  });

  it("commits numeric edits on blur and toggles GZCLP stages", async () => {
    const user = userEvent.setup();
    const onParamsChange = vi.fn();
    render(
      <StrategyParamsForm
        idPrefix="t"
        strategy="LINEAR"
        params={{
          strategy: "LINEAR",
          incrementKg: 2.5,
          failThreshold: 3,
          deloadPercent: 10,
        }}
        onStrategyChange={vi.fn()}
        onParamsChange={onParamsChange}
      />,
    );

    const increment = screen.getByLabelText("Increment (kg)");
    await user.clear(increment);
    await user.type(increment, "5");
    await user.tab();
    expect(onParamsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ strategy: "LINEAR", incrementKg: 5 }),
    );

    await user.click(
      screen.getByRole("checkbox", { name: /set × rep stages/i }),
    );
    expect(onParamsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        stages: [
          { sets: 5, reps: 3, amrapLast: true },
          { sets: 6, reps: 2, amrapLast: true },
          { sets: 10, reps: 1, amrapLast: true },
        ],
        stageResetPercent: 85,
      }),
    );
  });

  it("swaps RPE modes", async () => {
    const user = userEvent.setup();
    const onParamsChange = vi.fn();
    render(
      <StrategyParamsForm
        idPrefix="t"
        strategy="RPE"
        params={{
          strategy: "RPE",
          mode: "TOP_SET_BACKOFF",
          backoffPercent: 90,
          backoffSets: 3,
        }}
        onStrategyChange={vi.fn()}
        onParamsChange={onParamsChange}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Mode"), "RIR_MESOCYCLE");
    expect(onParamsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "RIR_MESOCYCLE",
        startRir: 3,
        endRir: 0,
      }),
    );
  });
});
