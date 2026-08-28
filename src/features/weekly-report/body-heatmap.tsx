import {
  BODY_REGIONS,
  SILHOUETTE_PATHS,
  type BodyView,
} from "./body-paths";
import { getHeatStep } from "./heat-scale";

export type MuscleHeat = {
  t: number;
  sets: number;
};

type BodyHeatmapProps = {
  view: BodyView;
  heatByMuscle: Map<string, MuscleHeat>;
};

const MIRROR_TRANSFORM = "translate(200,0) scale(-1,1)";

export default function BodyHeatmap({ view, heatByMuscle }: BodyHeatmapProps) {
  return (
    <svg
      viewBox="0 0 200 440"
      role="img"
      aria-label={
        view === "front"
          ? "Muscle engagement, front view"
          : "Muscle engagement, back view"
      }
      className="h-auto w-full"
    >
      <g fill="var(--muted)" fillOpacity={0.4}>
        {SILHOUETTE_PATHS.map((part, index) => (
          <g key={index}>
            <path d={part.d} />
            {part.mirror && <path d={part.d} transform={MIRROR_TRANSFORM} />}
          </g>
        ))}
      </g>
      {BODY_REGIONS[view].map((region) => {
        const heat = heatByMuscle.get(region.muscle);
        const step = getHeatStep(heat?.t ?? 0);
        return (
          <g
            key={region.muscle}
            fill={step.fill}
            fillOpacity={step.fillOpacity}
            stroke="var(--border)"
            strokeWidth={1}
          >
            <title>{`${region.muscle} — ${heat?.sets ?? 0} sets`}</title>
            <path d={region.d} />
            {region.mirror && (
              <path d={region.d} transform={MIRROR_TRANSFORM} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
