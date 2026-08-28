export type HeatStep = {
  fill: string;
  fillOpacity: number;
};

// Single-hue sequential scale matching the consistency strip idiom:
// zero engagement renders muted, everything else steps up in --chart-1.
export const HEAT_BINS: HeatStep[] = [
  { fill: "var(--muted)", fillOpacity: 0.25 },
  { fill: "var(--chart-1)", fillOpacity: 0.3 },
  { fill: "var(--chart-1)", fillOpacity: 0.55 },
  { fill: "var(--chart-1)", fillOpacity: 0.78 },
  { fill: "var(--chart-1)", fillOpacity: 1 },
];

export function getHeatStep(t: number): HeatStep {
  if (t <= 0) return HEAT_BINS[0];
  if (t <= 0.25) return HEAT_BINS[1];
  if (t <= 0.5) return HEAT_BINS[2];
  if (t <= 0.75) return HEAT_BINS[3];
  return HEAT_BINS[4];
}
