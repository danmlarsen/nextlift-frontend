"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type RestTimerState = {
  /** Epoch milliseconds when the rest ends. */
  endsAt: number;
  totalSeconds: number;
};

interface RestTimerContextValue {
  rest: RestTimerState | null;
  startRest: (seconds: number) => void;
  clearRest: () => void;
}

const RestTimerContext = createContext<RestTimerContextValue | null>(null);

const NOOP: RestTimerContextValue = {
  rest: null,
  startRest: () => {},
  clearRest: () => {},
};

/**
 * Rest countdown started when a prescribed set is completed. Lives above the
 * workout modal and the mini overlay so both can show it. Free workouts never
 * start it; a set only carries a rest when it came from a program.
 */
export function RestTimerProvider({ children }: { children: React.ReactNode }) {
  const [rest, setRest] = useState<RestTimerState | null>(null);

  const startRest = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    setRest({ endsAt: Date.now() + seconds * 1000, totalSeconds: seconds });
  }, []);

  const clearRest = useCallback(() => setRest(null), []);

  const value = useMemo(
    () => ({ rest, startRest, clearRest }),
    [rest, startRest, clearRest],
  );

  return (
    <RestTimerContext.Provider value={value}>
      {children}
    </RestTimerContext.Provider>
  );
}

/** Falls back to a no-op outside the provider (e.g. isolated component tests). */
export function useRestTimer(): RestTimerContextValue {
  return useContext(RestTimerContext) ?? NOOP;
}
