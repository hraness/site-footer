import { expect, test } from "bun:test";
import { attachFooterFoil } from "../src/foil.js";

test("foil tracks the pointer page-wide with damped bounded updates and resets on touch release, preference changes, or cleanup", () => {
  const prior = new Map<string, PropertyDescriptor | undefined>();
  const windowEvents = new Map<string, Function>();
  const preferenceEvents = new Map<string, Function>();
  const frames = new Map<number, FrameRequestCallback>();
  const values = new Map<string, string>();
  let reads = 0;
  let nextFrame = 0;
  const preference = {
    matches: true,
    addEventListener: (name: string, fn: Function) => preferenceEvents.set(name, fn),
    removeEventListener: (name: string) => preferenceEvents.delete(name),
  };
  class FakeElement {
    isConnected = true;
    style = { setProperty: (key: string, value: string) => values.set(key, value), removeProperty: (key: string) => values.delete(key) };
    getBoundingClientRect() { reads++; return { left: 10, top: 10, width: 100, height: 40 }; }
  }
  const target = new FakeElement();
  const root = {
    querySelectorAll: () => [target],
  };
  const overrides = {
    Element: FakeElement,
    window: {
      matchMedia: () => preference,
      addEventListener: (name: string, fn: Function) => windowEvents.set(name, fn),
      removeEventListener: (name: string) => windowEvents.delete(name),
    },
    requestAnimationFrame: (fn: FrameRequestCallback) => { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  };
  for (const [key, value] of Object.entries(overrides)) {
    prior.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const step = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(0)); };
  const settle = () => { for (let i = 0; i < 120 && frames.size > 0; i += 1) step(); };
  try {
    const cleanup = attachFooterFoil(root as unknown as HTMLElement);
    expect(frames.size).toBe(0);
    const move = windowEvents.get("pointermove")!;
    move({ pointerType: "touch", clientX: 20, clientY: 20 });
    expect(frames.size).toBe(1);
    settle();
    expect(values.get("--footer-foil-x")).toBe("10.0%");
    expect(values.get("--footer-foil-y")).toBe("25.0%");
    expect(values.get("--footer-foil-angle")).toBe("284.0deg");
    windowEvents.get("pointerup")!({ pointerType: "touch" });
    expect(values.size).toBe(0);
    windowEvents.get("pointerdown")!({ pointerType: "pen", clientX: 60, clientY: 30 });
    settle();
    expect(values.get("--footer-foil-x")).toBe("50.0%");
    move({ pointerType: "mouse", clientX: 20, clientY: 20 });
    move({ pointerType: "mouse", clientX: 500, clientY: -20 });
    expect(frames.size).toBe(1);
    step();
    const damped = Number.parseFloat(values.get("--footer-foil-x")!);
    expect(damped).toBeGreaterThan(50);
    expect(damped).toBeLessThan(200);
    settle();
    expect(values.get("--footer-foil-x")).toBe("200.0%");
    expect(values.get("--footer-foil-y")).toBe("-75.0%");
    expect(values.get("--footer-foil-angle")).toBe("83.5deg");
    expect(frames.size).toBe(0);
    const readsBeforeDrift = reads;
    move({ pointerType: "mouse", clientX: 60, clientY: 30 });
    settle();
    expect(reads).toBeGreaterThan(readsBeforeDrift);
    expect(values.get("--footer-foil-angle")).toBe("90.0deg");
    preference.matches = false;
    preferenceEvents.get("change")!();
    expect(frames.size).toBe(0);
    expect(values.size).toBe(0);
    cleanup();
    expect(windowEvents.size + preferenceEvents.size).toBe(0);
  } finally {
    for (const [key, descriptor] of prior) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
