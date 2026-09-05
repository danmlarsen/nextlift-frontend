import { useEffect } from "react";

// Smaller viewport changes are toolbar or URL-bar movement, not a keyboard.
const KEYBOARD_MIN_HEIGHT = 100;
// Phones restore (or drop) the keyboard a moment after the page comes back
// into view; measure again a few times so a missed resize event can't stick.
const RECHECK_DELAYS_MS = [50, 250, 600, 1200];

export const KEYBOARD_INSET_PROPERTY = "--keyboard-inset";
export const VISUAL_VIEWPORT_TOP_PROPERTY = "--visual-viewport-top";

let activeCount = 0;

function clearProperties() {
  const root = document.documentElement;
  root.style.removeProperty(KEYBOARD_INSET_PROPERTY);
  root.style.removeProperty(VISUAL_VIEWPORT_TOP_PROPERTY);
}

function measure() {
  const viewport = window.visualViewport;
  // Pinch-zoom shrinks the visual viewport too; only track the keyboard.
  const zoomed = !viewport || Math.abs(viewport.scale - 1) > 0.01;
  const top = zoomed ? 0 : Math.max(0, Math.round(viewport.offsetTop));
  const inset = zoomed
    ? 0
    : Math.max(
        0,
        Math.round(window.innerHeight - viewport.height - viewport.offsetTop),
      );

  if (inset < KEYBOARD_MIN_HEIGHT) {
    clearProperties();
    return;
  }

  const root = document.documentElement;
  root.style.setProperty(KEYBOARD_INSET_PROPERTY, `${inset}px`);
  root.style.setProperty(VISUAL_VIEWPORT_TOP_PROPERTY, `${top}px`);
}

/**
 * While `enabled`, publishes the on-screen keyboard's height as
 * `--keyboard-inset` (and the visual viewport's offset as
 * `--visual-viewport-top`) on <html>, so a full-screen drawer can size
 * itself to the visible area. Both are absent while the keyboard is closed.
 *
 * Every value is re-measured from window.visualViewport on each event;
 * nothing is toggled or remembered between events. Vaul's built-in keyboard
 * handling keeps a toggled "keyboard open" flag that desyncs when the
 * keyboard animates in steps or changes height, after which switching apps
 * leaves the drawer stuck at keyboard size (vaul#538, vaul#503).
 */
export function useKeyboardInset(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    let pendingTimers: number[] = [];
    const measureSoon = () => {
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
      pendingTimers = RECHECK_DELAYS_MS.map((delay) =>
        window.setTimeout(measure, delay),
      );
      measure();
    };

    activeCount += 1;
    measure();
    viewport.addEventListener("resize", measure);
    viewport.addEventListener("scroll", measure);
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", measureSoon);
    document.addEventListener("visibilitychange", measureSoon);
    document.addEventListener("focusin", measureSoon);
    document.addEventListener("focusout", measureSoon);

    return () => {
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
      viewport.removeEventListener("resize", measure);
      viewport.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", measureSoon);
      document.removeEventListener("visibilitychange", measureSoon);
      document.removeEventListener("focusin", measureSoon);
      document.removeEventListener("focusout", measureSoon);
      activeCount -= 1;
      if (activeCount === 0) clearProperties();
    };
  }, [enabled]);
}
