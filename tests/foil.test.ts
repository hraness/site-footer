import { expect, test } from "bun:test";
import { attachFooterFoil } from "../src/foil.js";

test("foil coalesces pointer frames, caches bounds, and cancels on preference changes or cleanup", () => {
  const prior = new Map<string, PropertyDescriptor | undefined>();
  const rootEvents = new Map<string, Function>();
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
    closest() { return this; }
    getBoundingClientRect() { reads++; return { left: 10, top: 10, width: 100, height: 40 }; }
  }
  const target = new FakeElement();
  const root = {
    contains: (node: unknown) => node === target,
    addEventListener: (name: string, fn: Function) => rootEvents.set(name, fn),
    removeEventListener: (name: string) => rootEvents.delete(name),
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
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(0)); };
  try {
    const cleanup = attachFooterFoil(root as unknown as HTMLElement);
    expect(frames.size).toBe(0);
    const move = rootEvents.get("pointermove")!;
    move({ target, pointerType: "touch", clientX: 20, clientY: 20 });
    expect(frames.size).toBe(1);
    flush();
    expect(values.get("--footer-foil-x")).toBe("10.0%");
    expect(values.get("--footer-foil-y")).toBe("25.0%");
    expect(values.get("--footer-foil-angle")).toBe("36.0deg");
    rootEvents.get("pointerup")!({ pointerType: "touch" });
    expect(values.size).toBe(0);
    rootEvents.get("pointerdown")!({ target, pointerType: "pen", clientX: 60, clientY: 30 });
    flush();
    expect(values.get("--footer-foil-x")).toBe("50.0%");
    move({ target, pointerType: "mouse", clientX: 20, clientY: 20 });
    move({ target, pointerType: "mouse", clientX: 60, clientY: 30 });
    expect(frames.size).toBe(1);
    flush();
    expect(reads).toBe(2);
    expect(values.get("--footer-foil-x")).toBe("50.0%");
    expect(values.get("--footer-foil-y")).toBe("50.0%");
    expect(frames.size).toBe(0);
    move({ target, pointerType: "mouse", clientX: 500, clientY: -20 });
    flush();
    expect(reads).toBe(2);
    expect(values.get("--footer-foil-x")).toBe("100.0%");
    expect(values.get("--footer-foil-y")).toBe("0.0%");
    windowEvents.get("resize")!();
    move({ target, pointerType: "mouse", clientX: 60, clientY: 30 });
    flush();
    expect(reads).toBe(3);
    move({ target, pointerType: "mouse", clientX: 60, clientY: 30 });
    preference.matches = false;
    preferenceEvents.get("change")!();
    expect(frames.size).toBe(0);
    expect(values.size).toBe(0);
    cleanup();
    expect(rootEvents.size + windowEvents.size + preferenceEvents.size).toBe(0);
  } finally {
    for (const [key, descriptor] of prior) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
