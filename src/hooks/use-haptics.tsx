import { useCallback } from "react";

type HapticStyle = "light" | "medium" | "heavy" | "success" | "error";

const hasVibration = typeof navigator !== undefined && "vibrate" in navigator;

export function useHaptics(options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {};

  const vibrate = useCallback(
    (style: HapticStyle = "light") => {
      if (!enabled || !hasVibration) return;

      const patternMap: Record<HapticStyle, number | number[]> = {
        light: 10,
        medium: [15, 30],
        heavy: [30, 40],
        success: [10, 30, 10],
        error: [20, 40, 20],
      };

      navigator.vibrate(patternMap[style]);
    },
    [enabled],
  );

  return { vibrate };
}
