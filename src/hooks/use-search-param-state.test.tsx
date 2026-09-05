import { renderHook } from "@testing-library/react";

let currentSearch = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(currentSearch),
  usePathname: () => "/app",
}));

import { useSearchParamState } from "./use-search-param-state";

describe("useSearchParamState", () => {
  const pushState = vi.spyOn(window.history, "pushState");
  const replaceState = vi.spyOn(window.history, "replaceState");

  beforeEach(() => {
    currentSearch = "";
    pushState.mockClear();
    replaceState.mockClear();
  });

  it("reads the open flag from the URL", () => {
    currentSearch = "workout-modal=open";
    const { result } = renderHook(() => useSearchParamState("workout-modal"));
    expect(result.current[0]).toBe(true);
  });

  it("opens by pushing a history entry without a router navigation", () => {
    currentSearch = "tab=history";
    const { result } = renderHook(() => useSearchParamState("workout-modal"));

    result.current[1](true);

    expect(pushState).toHaveBeenCalledWith(
      null,
      "",
      "/app?tab=history&workout-modal=open",
    );
    expect(replaceState).not.toHaveBeenCalled();
  });

  it("closes by replacing the current entry and drops the empty query", () => {
    currentSearch = "workout-modal=open";
    const { result } = renderHook(() => useSearchParamState("workout-modal"));

    result.current[1](false);

    expect(replaceState).toHaveBeenCalledWith(null, "", "/app");
    expect(pushState).not.toHaveBeenCalled();
  });

  it("does nothing when the URL already reflects the requested state", () => {
    currentSearch = "workout-modal=open";
    const { result } = renderHook(() => useSearchParamState("workout-modal"));

    result.current[1](true);

    expect(pushState).not.toHaveBeenCalled();
    expect(replaceState).not.toHaveBeenCalled();
  });
});
