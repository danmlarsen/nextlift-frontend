import {
  type EffortScale,
  type ProgramBlockData,
  type ProgramScheduleMode,
} from "@/api/programs/types";
import { Chip } from "../program-badges";
import ProgramDayCard from "./program-day-card";

interface ProgramBlockSectionProps {
  block: ProgramBlockData;
  showBlockHeading: boolean;
  effortScale: EffortScale;
  scheduleMode: ProgramScheduleMode;
}

export default function ProgramBlockSection({
  block,
  showBlockHeading,
  effortScale,
  scheduleMode,
}: ProgramBlockSectionProps) {
  return (
    <section className="space-y-3">
      {showBlockHeading && (
        <div>
          <h2 className="text-lg font-semibold">{block.name}</h2>
          {block.focus && (
            <p className="text-muted-foreground text-sm">{block.focus}</p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5" aria-label="Weeks">
        {block.weeks.map((week) => (
          <Chip
            key={week.id}
            className={
              week.isDeload
                ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            }
          >
            Week {week.weekInBlock}
            {week.label ? ` · ${week.label}` : week.isDeload ? " · Deload" : ""}
          </Chip>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {block.days.map((day) => (
          <ProgramDayCard
            key={day.id}
            day={day}
            effortScale={effortScale}
            scheduleMode={scheduleMode}
          />
        ))}
      </div>
    </section>
  );
}
