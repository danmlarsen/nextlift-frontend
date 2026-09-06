import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RestTimerBadge from "./rest-timer-badge";
import { RestTimerProvider, useRestTimer } from "./rest-timer-context";

function StartButton({ seconds }: { seconds: number }) {
  const { startRest } = useRestTimer();
  return <button onClick={() => startRest(seconds)}>start</button>;
}

describe("RestTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing until a rest is started", () => {
    render(
      <RestTimerProvider>
        <RestTimerBadge />
      </RestTimerProvider>,
    );
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("counts down from the prescribed rest, ends and can be dismissed", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <RestTimerProvider>
        <StartButton seconds={90} />
        <RestTimerBadge />
      </RestTimerProvider>,
    );

    await user.click(screen.getByText("start"));
    expect(screen.getByRole("timer")).toHaveTextContent("Rest 01:30");

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("Rest 00:30");

    await act(async () => {
      vi.advanceTimersByTime(31_000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("Rest over");

    await user.click(
      screen.getByRole("button", { name: "Dismiss rest timer" }),
    );
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("is a no-op outside the provider", () => {
    render(<RestTimerBadge />);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });
});
