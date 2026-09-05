/**
 * The mobile drawer is full screen, so it must shrink above the on-screen
 * keyboard and grow back when the keyboard goes away, including the messy
 * sequences phones produce: keyboards that animate in steps, change height
 * between input types, or disappear while the app is in the background.
 */
import { act, render, screen } from "@testing-library/react";
import {
  KEYBOARD_INSET_PROPERTY,
  VISUAL_VIEWPORT_TOP_PROPERTY,
} from "@/hooks/use-keyboard-inset";
import { ResponsiveModal } from "./responsive-modal";

const VIEWPORT_HEIGHT = 844;

class FakeVisualViewport extends EventTarget {
  height = VIEWPORT_HEIGHT;
  width = 390;
  offsetTop = 0;
  offsetLeft = 0;
  pageTop = 0;
  pageLeft = 0;
  scale = 1;
}

let visualViewport: FakeVisualViewport;

beforeEach(() => {
  visualViewport = new FakeVisualViewport();
  Object.defineProperty(window, "innerHeight", {
    value: VIEWPORT_HEIGHT,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, "visualViewport", {
    value: visualViewport,
    configurable: true,
    writable: true,
  });
  window.matchMedia = (query: string) =>
    ({
      matches: false, // below the desktop breakpoint: vaul drawer
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
});

function keyboardInset() {
  return document.documentElement.style.getPropertyValue(
    KEYBOARD_INSET_PROPERTY,
  );
}

function visualViewportTop() {
  return document.documentElement.style.getPropertyValue(
    VISUAL_VIEWPORT_TOP_PROPERTY,
  );
}

function renderDrawer(isOpen = true) {
  return render(
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={() => {}}
      title="Workout"
      description="Workout"
      content={<input type="number" aria-label="Weight" />}
    />,
  );
}

async function openDrawerWithFocusedInput() {
  const view = renderDrawer();
  await screen.findByRole("dialog");
  const input = screen.getByLabelText("Weight");
  act(() => input.focus());
  return { ...view, input };
}

function keyboardResize(height: number, offsetTop = 0) {
  act(() => {
    visualViewport.height = height;
    visualViewport.offsetTop = offsetTop;
    visualViewport.dispatchEvent(new Event("resize"));
  });
}

describe("ResponsiveModal on-screen keyboard handling", () => {
  it("publishes the keyboard height while the keyboard is open", async () => {
    await openDrawerWithFocusedInput();

    keyboardResize(500);

    expect(keyboardInset()).toBe("344px");
    expect(visualViewportTop()).toBe("0px");
  });

  it("follows the visual viewport when the browser pans it", async () => {
    await openDrawerWithFocusedInput();

    keyboardResize(500, 100);

    expect(keyboardInset()).toBe("244px");
    expect(visualViewportTop()).toBe("100px");
  });

  it.each([
    { name: "opened in a single step", heights: [500] },
    { name: "animated in two steps", heights: [672, 500] },
    {
      name: "changed from a number pad to a text keyboard",
      heights: [553, 464],
    },
  ])(
    "clears the inset after an app switch when the keyboard $name",
    async ({ heights }) => {
      const { input } = await openDrawerWithFocusedInput();
      heights.forEach((height) => keyboardResize(height));
      expect(keyboardInset()).not.toBe("");

      // Switching apps blurs the input first; the keyboard closes afterwards.
      act(() => input.blur());
      keyboardResize(VIEWPORT_HEIGHT);

      expect(keyboardInset()).toBe("");
      expect(visualViewportTop()).toBe("");
    },
  );

  it("re-measures when the page becomes visible without a resize event", async () => {
    const { input } = await openDrawerWithFocusedInput();
    keyboardResize(500);

    act(() => {
      input.blur();
      // The keyboard went away while the app was in the background and the
      // browser never delivered the matching resize event.
      visualViewport.height = VIEWPORT_HEIGHT;
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(keyboardInset()).toBe("");
  });

  it("ignores small viewport changes such as toolbar movement", async () => {
    await openDrawerWithFocusedInput();

    keyboardResize(VIEWPORT_HEIGHT - 60);

    expect(keyboardInset()).toBe("");
  });

  it("removes the variables when the drawer closes", async () => {
    const { rerender } = await openDrawerWithFocusedInput();
    keyboardResize(500);
    expect(keyboardInset()).toBe("344px");

    rerender(
      <ResponsiveModal
        isOpen={false}
        onOpenChange={() => {}}
        title="Workout"
        description="Workout"
        content={<input type="number" aria-label="Weight" />}
      />,
    );

    expect(keyboardInset()).toBe("");
  });
});
