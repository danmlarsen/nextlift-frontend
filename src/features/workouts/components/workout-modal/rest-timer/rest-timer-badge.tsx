"use client";

import { useEffect, useRef, useState } from "react";
import { TimerIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/use-haptics";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRestTimer } from "./rest-timer-context";

/** How long "Rest over" stays visible before the badge clears itself. */
const LINGER_MS = 5000;

interface RestTimerBadgeProps {
  className?: string;
  compact?: boolean;
}

export default function RestTimerBadge({
  className,
  compact = false,
}: RestTimerBadgeProps) {
  const { rest, clearRest } = useRestTimer();
  const { vibrate } = useHaptics();
  const [remaining, setRemaining] = useState(0);
  const buzzedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!rest) return;
    const tick = () =>
      setRemaining(Math.max(0, Math.ceil((rest.endsAt - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [rest]);

  useEffect(() => {
    if (!rest || remaining > 0) return;
    if (buzzedFor.current !== rest.endsAt) {
      buzzedFor.current = rest.endsAt;
      vibrate("success");
    }
    const timeout = setTimeout(clearRest, LINGER_MS);
    return () => clearTimeout(timeout);
  }, [rest, remaining, vibrate, clearRest]);

  if (!rest) return null;

  const done = remaining <= 0;
  const label = done ? "Rest over" : formatTime(remaining);

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={done ? "Rest over" : `Rest ${label}`}
      className={cn(
        "bg-secondary text-secondary-foreground flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium tabular-nums",
        done && "bg-accent text-accent-foreground",
        className,
      )}
    >
      <TimerIcon className="size-3.5" />
      <span>{compact ? label : `Rest ${label}`}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-5 rounded-full"
        onClick={clearRest}
        aria-label="Dismiss rest timer"
      >
        <XIcon className="size-3" />
      </Button>
    </div>
  );
}
