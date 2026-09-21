import { expect, test } from "bun:test";
import { attachFooterFoil } from "../src/foil.js";

function harness(enabled = true) {
  const prior = new Map<string, PropertyDescriptor | undefined>();
  const windowEvents = new Map<string, Function>();
  const documentEvents = new Map<string, Function>();
  const preferenceEvents = new Map<string, Function>();
  const frames = new Map<number, FrameRequestCallback>();
  const values = new Map<string, string>();
  let reads = 0;
  let nextFrame = 0;
  let clock = 0;
  const preference = {
    matches: enabled,
    addEventListener: (name: string, fn: Function) => preferenceEvents.set(name, fn),
    removeEventListener: (name: string) => preferenceEvents.delete(name),
  };
  class FakeElement {
    isConnected = true;
    parentElement = null;
    style = {
      setProperty: (key: string, value: string) => values.set(key, value),
      removeProperty: (key: string) => values.delete(key),
    };
    getBoundingClientRect() { reads++; return { left: 10, top: 10, width: 100, height: 40, right: 110, bottom: 50 }; }
    closest() { return null; }
  }
  const target = new FakeElement();
  const document = {
    hidden: false,
    addEventListener: (name: string, fn: Function) => documentEvents.set(name, fn),
    removeEventListener: (name: string) => documentEvents.delete(name),
  };
  const root = {
    matches: () => false,
    contains: () => true,
    querySelectorAll: () => [target],
  };
  const overrides = {
    Element: FakeElement,
    document,
    window: {
      matchMedia: () => preference,
      addEventListener: (name: string, fn: Function) => windowEvents.set(name, fn),
      removeEventListener: (name: string) => windowEvents.delete(name),
      innerWidth: 1280,
      innerHeight: 800,
    },
    requestAnimationFrame: (fn: FrameRequestCallback) => { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  };
  for (const [key, value] of Object.entries(overrides)) {
    prior.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const step = () => {
    const pending = [...frames.values()];
    frames.clear();
    clock += 16.7;
    pending.forEach(fn => fn(clock));
  };
  const settle = () => { for (let i = 0; i < 120 && frames.size > 0; i += 1) step(); };
  const restore = () => {
    for (const [key, descriptor] of prior) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  };
  return { target, root, values, frames, step, settle, restore, windowEvents, documentEvents, preferenceEvents, preference, document, reads: () => reads };
}

test("foil eases two bounded light inputs toward the pointer and never rotates the material", () => {
  const f = harness();
  try {
    const cleanup = attachFooterFoil(f.root as unknown as HTMLElement);
    expect(f.frames.size).toBe(0);
    const move = f.windowEvents.get("pointermove")!;
    move({ pointerType: "mouse", clientX: 20, clientY: 20 });
    expect(f.frames.size).toBe(1);
    // One frame only eases partway toward the goal.
    f.step();
    const damped = Number.parseFloat(f.values.get("--hraness-foil-x")!);
    expect(damped).toBeGreaterThan(35);
    expect(damped).toBeLessThan(50);
    f.settle();
    // Pointer (20,20) over a 100x40 control at (10,10): x = 50 - 15 = 35, y = 50 - 4.17.
    expect(f.values.get("--hraness-foil-x")).toBe("35.00%");
    expect(f.values.get("--hraness-foil-y")).toBe("45.83%");
    expect(f.values.get("--hraness-foil-angle")).toBeUndefined();
    // Far-off pointers clamp to the material bounds instead of overshooting.
    move({ pointerType: "mouse", clientX: 5000, clientY: -9999 });
    f.settle();
    expect(f.values.get("--hraness-foil-x")).toBe("92.00%");
    expect(f.values.get("--hraness-foil-y")).toBe("8.00%");
    expect(f.frames.size).toBe(0);
    // pointerdown primes the same light so a press lands lit.
    f.windowEvents.get("pointerdown")!({ pointerType: "pen", clientX: 60, clientY: 30 });
    f.settle();
    expect(f.values.get("--hraness-foil-x")).toBe("50.00%");
    expect(f.values.get("--hraness-foil-y")).toBe("50.00%");
    cleanup();
    expect(f.values.size).toBe(0);
    expect(f.windowEvents.size + f.preferenceEvents.size + f.documentEvents.size).toBe(0);
  } finally {
    f.restore();
  }
});

test("touch, pointer cancel, blur, scroll, resize, window exit, and hiding reset the light", () => {
  const f = harness();
  try {
    const cleanup = attachFooterFoil(f.root as unknown as HTMLElement);
    const lit = () => {
      f.windowEvents.get("pointermove")!({ pointerType: "mouse", clientX: 20, clientY: 20 });
      f.settle();
      expect(f.values.get("--hraness-foil-x")).toBe("35.00%");
    };
    const idle = () => expect(f.values.size).toBe(0);
    lit();
    f.windowEvents.get("pointermove")!({ pointerType: "touch", clientX: 20, clientY: 20 });
    idle();
    lit();
    f.windowEvents.get("pointercancel")!({});
    idle();
    lit();
    f.windowEvents.get("pointerout")!({ relatedTarget: null });
    idle();
    for (const name of ["blur", "scroll", "resize"]) {
      lit();
      f.windowEvents.get(name)!({});
      idle();
    }
    lit();
    f.document.hidden = true;
    f.documentEvents.get("visibilitychange")!();
    idle();
    f.document.hidden = false;
    lit();
    f.preference.matches = false;
    f.preferenceEvents.get("change")!();
    idle();
    cleanup();
  } finally {
    f.restore();
  }
});

test("foil stays inert without motion or color and tolerates a missing view", () => {
  const f = harness(false);
  try {
    const cleanup = attachFooterFoil(f.root as unknown as HTMLElement);
    f.windowEvents.get("pointermove")!({ pointerType: "mouse", clientX: 20, clientY: 20 });
    f.settle();
    expect(f.values.size).toBe(0);
    cleanup();
    // No matchMedia or frame scheduling: the enhancement never installs.
    (globalThis as { window: unknown }).window = {};
    const inert = attachFooterFoil(f.root as unknown as HTMLElement);
    expect(typeof inert).toBe("function");
    inert();
  } finally {
    f.restore();
  }
});
