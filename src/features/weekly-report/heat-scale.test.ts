import { describe, expect, it } from "vitest";

import { getHeatStep, HEAT_BINS } from "./heat-scale";

describe("getHeatStep", () => {
  it("returns the muted zero state for t = 0", () => {
    expect(getHeatStep(0)).toBe(HEAT_BINS[0]);
    expect(getHeatStep(0).fill).toBe("var(--muted)");
  });

  it("steps through the bins at the boundaries", () => {
    expect(getHeatStep(0.1)).toBe(HEAT_BINS[1]);
    expect(getHeatStep(0.25)).toBe(HEAT_BINS[1]);
    expect(getHeatStep(0.26)).toBe(HEAT_BINS[2]);
    expect(getHeatStep(0.5)).toBe(HEAT_BINS[2]);
    expect(getHeatStep(0.75)).toBe(HEAT_BINS[3]);
    expect(getHeatStep(0.76)).toBe(HEAT_BINS[4]);
  });

  it("returns full intensity for t = 1", () => {
    expect(getHeatStep(1)).toBe(HEAT_BINS[4]);
    expect(getHeatStep(1).fillOpacity).toBe(1);
  });
});
