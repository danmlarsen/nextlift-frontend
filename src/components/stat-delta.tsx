import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from "lucide-react";

import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Stored floats come back from the API with tiny rounding noise, so treat
// near-equal values as unchanged instead of comparing exactly.
const VALUE_EPSILON = 1e-9;

interface StatDeltaProps {
  current: number;
  previous?: number;
  /** Unit label used when the change can't be shown as a percentage. */
  unit?: string;
  className?: string;
}

/**
 * Compact "vs previous period" badge: ▲ 12% / ▼ 8% / – no change.
 * Renders nothing when there is no previous value to compare against.
 */
export default function StatDelta({
  current,
  previous,
  unit,
  className,
}: StatDeltaProps) {
  if (previous === undefined) return null;

  const change = current - previous;

  if (Math.abs(change) < VALUE_EPSILON) {
    return (
      <p
        className={cn(
          "text-muted-foreground flex items-center justify-center gap-0.5 text-xs",
          className,
        )}
      >
        <MinusIcon aria-hidden="true" className="size-3" />
        <span>no change</span>
      </p>
    );
  }

  const increased = change > 0;
  const Icon = increased ? ChevronUpIcon : ChevronDownIcon;
  // With no meaningful previous value a percentage is undefined — fall back
  // to the absolute change.
  const text =
    Math.abs(previous) < VALUE_EPSILON
      ? `${formatNumber(Math.abs(change))}${unit ? ` ${unit}` : ""}`
      : `${formatNumber(Math.abs(change / previous) * 100, { maximumFractionDigits: 0 })}%`;

  return (
    <p
      className={cn(
        "text-muted-foreground flex items-center justify-center gap-0.5 text-xs",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-3", increased ? "text-green-500" : "text-red-500")}
      />
      <span>
        {text} vs prior week
        <span className="sr-only">{increased ? " (up)" : " (down)"}</span>
      </span>
    </p>
  );
}
