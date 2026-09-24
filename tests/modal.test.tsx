import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { footerInnerClassName } from "../src/footer.stylex.js";
import { act } from "react";
import { HranessSiteFooter, type HranessSiteFooterProps, type HranessFooterConversionEvent } from "../src/react.js";

const signup = { kind: "signup", audience: "hraness" } as const;
const unnamed = { kind: "signup", audience: "aicharts" } as const;
const fixed = { version: 1, token: "f".repeat(64), expiresAt: Date.now() + 48 * 60 * 60 * 1000, assignment: {
  id: "123e4567-e89b-42d3-a456-426614174000", locale: "en", layout: "button", copyStyle: "direct",
  color: "green", shimmer: false, cohort: "fixed", policyVersion: "stable-modal-v1", viewport: "wide",
} };

const copyEnvelope = (copyStyle: string) => ({ ...fixed, token: "c".repeat(64), assignment: { ...fixed.assignment, copyStyle, cohort: "explore", policyVersion: "copy-modal-v1" } });

async function fixture(run: (f: {
  container: HTMLElement; window: ReturnType<typeof parseHTML>["window"];
  render: (props?: Partial<HranessSiteFooterProps>, packageDefault?: boolean) => Promise<void>;
  click: (target: Element) => Promise<void>;
  requests: Array<{ url: string; init: RequestInit; resolve: (value: Response) => void }>;
  events: HranessFooterConversionEvent[]; viewport: EventTarget & { height: number; offsetTop: number };
  visible: () => void;
}) => Promise<void>) {
  const { window } = parseHTML('<html><body><a id="host" href="#">Host</a><div id="root"></div></body></html>');
  const events: HranessFooterConversionEvent[] = [];
  const requests: Array<{ url: string; init: RequestInit; resolve: (value: Response) => void }> = [];
  const viewport = Object.assign(new window.EventTarget(), { height: 800, offsetTop: 0 });
  Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport });
  Object.defineProperty(window, "localStorage", { configurable: true, value: { getItem: () => "accepted" } });
  Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }) });
  Object.defineProperty(window.document, "visibilityState", { configurable: true, value: "visible" });
  const stylePrototype = Object.getPrototypeOf(window.document.documentElement.style);
  const priorityDescriptor = Object.getOwnPropertyDescriptor(stylePrototype, "getPropertyPriority");
  Object.defineProperty(stylePrototype, "getPropertyPriority", { configurable: true, value: () => "" });
  const proto = window.HTMLElement.prototype;
  const savedPrototype = new Map(["focus", "open", "showModal", "close"].map(key => [key, Object.getOwnPropertyDescriptor(proto, key)]));
  let active: Element | null = null;
  Object.defineProperty(window.document, "activeElement", { configurable: true, get: () => active });
  Object.defineProperty(proto, "focus", { configurable: true, value: function(this: HTMLElement) { active = this; } });
  Object.defineProperty(proto, "open", { configurable: true, get(this: HTMLElement) { return this.hasAttribute("open"); }, set(this: HTMLElement, value: boolean) { this.toggleAttribute("open", value); } });
  Object.defineProperty(proto, "showModal", { configurable: true, value: function(this: HTMLElement) { this.setAttribute("open", ""); } });
  Object.defineProperty(proto, "close", { configurable: true, value: function(this: HTMLElement) { this.removeAttribute("open"); this.dispatchEvent(new window.Event("close")); } });
  const intersections = new Set<IntersectionObserverCallback>();
  const overrides = {
    Comment: window.Comment, document: window.document, Element: window.Element, Event: window.Event,
    HTMLElement: window.HTMLElement, HTMLInputElement: window.HTMLInputElement, MutationObserver: window.MutationObserver,
    navigator: window.navigator, Node: window.Node, Text: window.Text, window, IS_REACT_ACT_ENVIRONMENT: true,
    IntersectionObserver: class {
      constructor(readonly callback: IntersectionObserverCallback) { intersections.add(callback); }
      observe() {} disconnect() { intersections.delete(this.callback); }
    },
    fetch: ((url: unknown, init: RequestInit = {}) => new Promise<Response>(resolve => requests.push({ url: String(url), init, resolve }))) as typeof fetch,
  };
  const originals = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries(overrides)) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const container = window.document.querySelector<HTMLElement>("#root")!;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container);
  try {
    await run({ container, window, viewport, events, requests,
      render: async (props = {}, packageDefault = false) => { await act(async () => root.render(<HranessSiteFooter mailingList={signup} locale="en" {...(packageDefault ? {} : { attribution: false })} onConversion={event => events.push(event)} {...props} />)); },
      click: async target => { await act(async () => target.dispatchEvent(new window.Event("click", { bubbles: true, cancelable: true }))); },
      visible: () => intersections.forEach(callback => callback([{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry], {} as IntersectionObserver)),
    });
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
    }
    if (priorityDescriptor) Object.defineProperty(stylePrototype, "getPropertyPriority", priorityDescriptor);
    else Reflect.deleteProperty(stylePrototype, "getPropertyPriority");
    for (const [key, descriptor] of savedPrototype) {
      if (descriptor) Object.defineProperty(proto, key, descriptor); else Reflect.deleteProperty(proto, key);
    }
  }
}

test("stable modal preserves native input, focus and open state through experiment and telemetry changes", async () => {
  await fixture(async ({ render, container, window, click, events, requests, viewport }) => {
    await render();
    const trigger = container.querySelector("summary")!;
    const dialog = container.querySelector<HTMLDialogElement>("dialog")!;
    const input = container.querySelector<HTMLInputElement>('input[name="email"]')!;
    expect(requests).toHaveLength(0);
    expect(trigger.textContent).toBe("Get email updates");
    expect(dialog.open).toBeFalse();
    await click(trigger);
    expect(dialog.open).toBeTrue();
    expect(window.document.activeElement === input).toBeTrue();
    const close = container.querySelector<HTMLButtonElement>('[data-slot="hraness-mailing-close"]')!;
    const submit = container.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    // Linkedom has no native focus navigation; mark the browser's default stops.
    for (const control of [close, input, submit]) Object.defineProperty(control, "tabIndex", { configurable: true, value: 0 });
    await act(async () => {
      submit.focus();
      const tab = new window.Event("keydown", { bubbles: true, cancelable: true });
      Object.assign(tab, { key: "Tab", shiftKey: false });
      submit.dispatchEvent(tab);
    });
    expect(window.document.activeElement === close).toBeTrue();
    await act(async () => {
      const tab = new window.Event("keydown", { bubbles: true, cancelable: true });
      Object.assign(tab, { key: "Tab", shiftKey: true });
      close.dispatchEvent(tab);
    });
    expect(window.document.activeElement === submit).toBeTrue();
    input.value = "private@example.test";
    await act(async () => { input.dispatchEvent(new window.Event("input", { bubbles: true })); input.dispatchEvent(new window.Event("input", { bubbles: true })); });
    await render({ experiment: false });
    await render({ experiment: true });
    expect(container.querySelector("dialog")).toBe(dialog);
    expect(container.querySelector('input[name="email"]')).toBe(input);
    expect(input.value).toBe("private@example.test");
    expect(dialog.open).toBeTrue();
    expect(container.querySelector("footer")?.hasAttribute("data-experiment")).toBeFalse();
    viewport.height = 300; viewport.offsetTop = 60;
    viewport.dispatchEvent(new window.Event("resize"));
    expect(dialog.style.getPropertyValue("--hraness-signup-viewport-height")).toBe("300px");
    expect(dialog.style.getPropertyValue("--hraness-signup-viewport-top")).toBe("60px");
    await act(async () => { const event = new window.Event("keydown", { bubbles: true, cancelable: true }); Object.defineProperty(event, "key", { value: "Escape" }); input.dispatchEvent(event); });
    expect(dialog.open).toBeFalse();
    expect(window.document.activeElement === trigger).toBeTrue();
    expect(window.document.documentElement.style.getPropertyValue("overflow")).not.toBe("hidden");
    await click(trigger);
    expect(input.value).toBe("private@example.test");
    await click(container.querySelector('[data-slot="hraness-mailing-close"]')!);
    expect(events.map(event => event.stage)).toEqual(["open", "input_started", "close", "open", "close"]);
    expect(events.filter(event => event.stage === "close").map(event => event.reason)).toEqual(["escape", "dismiss_button"]);
    expect(JSON.stringify(events)).not.toContain("private");
    for (const event of events) expect(Object.keys(event).sort()).toEqual((event.reason ? ["audience", "locale", "presentationVersion", "reason", "stage"] : ["audience", "locale", "presentationVersion", "stage"]).sort());
  });
});

test("duplicate submits are suppressed and generic acceptance preserves the stable trigger", async () => {
  await fixture(async ({ render, container, window, click, requests, events }) => {
    await render();
    const trigger = container.querySelector("summary")!;
    await click(trigger);
    const form = container.querySelector("form")!;
    const input = form.querySelector<HTMLInputElement>('input[name="email"]')!;
    input.value = "private@example.test";
    await act(async () => { for (let i = 0; i < 2; i++) form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })); });
    expect(requests).toHaveLength(1);
    expect(events.filter(event => event.stage === "submit")).toHaveLength(1);
    expect(container.querySelector('input[name="email"]')).toBe(input);
    await act(async () => requests[0]!.resolve(new Response(null, { status: 202 })));
    expect(container.querySelector("summary")).toBe(trigger);
    expect(trigger.textContent).toBe("Get email updates");
    expect(form.hidden).toBeTrue();
    const status = container.querySelector('[data-slot="hraness-mailing-list-status"]')!;
    expect(status.textContent).toBe("Check your email for a confirmation link.");
    expect(window.document.activeElement === status).toBeTrue();
    expect(events.filter(event => event.stage === "accepted")).toHaveLength(1);
    expect(events.some(event => String(event.stage).includes("confirmed"))).toBeFalse();
  });
});

test("delayed or failed attribution never changes the CTA and stale eligibility cannot attribute success", async () => {
  await fixture(async ({ render, container, window, click, requests, events }) => {
    // A product list without a name stays on the fixed label and protocol.
    await render({ attribution: true, mailingList: unnamed });
    const trigger = container.querySelector("summary")!;
    await click(trigger);
    const input = container.querySelector<HTMLInputElement>('input[name="email"]')!;
    input.value = "preserve@example.test";
    expect(JSON.parse(String(requests[0]!.init.body)).presentationVersion).toBe("stable-modal-v1");
    await render({ attribution: false, onConversion: undefined, mailingList: unnamed });
    expect(requests[0]!.init.signal?.aborted).toBeTrue();
    await act(async () => requests[0]!.resolve(Response.json(fixed)));
    expect(container.querySelector('input[name="email"]')).toBe(input);
    expect(input.value).toBe("preserve@example.test");
    expect(container.querySelector<HTMLInputElement>('input[name="experimentToken"]')!.disabled).toBeTrue();
    await render({ attribution: true, mailingList: unnamed });
    await act(async () => requests[1]!.resolve(new Response(null, { status: 503 })));
    expect(container.querySelector("summary")).toBe(trigger);
    expect(container.querySelector<HTMLDialogElement>("dialog")!.open).toBeTrue();
    await act(async () => container.querySelector("form")!.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
    await render({ attribution: false, onConversion: undefined, mailingList: unnamed });
    await render({ mailingList: unnamed });
    await act(async () => requests[2]!.resolve(new Response(null, { status: 202 })));
    expect(events.filter(event => event.stage === "accepted")).toHaveLength(0);
    expect(container.querySelector('[data-slot="hraness-mailing-list-status"]')?.textContent).toBe("Check your email for a confirmation link.");
  });
});

test("later telemetry eligibility emits one visible impression and observer exceptions cannot block opening", async () => {
  await fixture(async ({ render, container, click, visible, events }) => {
    await render({ onConversion: undefined });
    visible();
    await render();
    visible();
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 430)); });
    await render(); visible();
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 430)); });
    expect(events.filter(event => event.stage === "impression")).toHaveLength(1);
    await render({ onConversion: () => { throw new Error("observer failure"); } });
    await click(container.querySelector("summary")!);
    expect(container.querySelector<HTMLDialogElement>("dialog")!.open).toBeTrue();
  });
});


test("hidden-brand layout survives support updates without resetting the signup", async () => {
  await fixture(async ({ render, container }) => {
    await render({ showBrand: false });
    const trigger = container.querySelector("summary");
    const inner = () => container.querySelector(".hraness-site-footer__inner")!;
    expect(inner().className).toBe(footerInnerClassName(true, true, "green", false, false, false));
    const support = { id: "hraness", name: "Hraness", updates: true, valueProposition: "Support Hraness." };
    await render({ showBrand: false, support });
    expect(inner().className).toBe(footerInnerClassName(true, true, "green", false, true, false));
    expect(container.querySelector("summary")).toBe(trigger);
    expect(container.querySelector(".hraness-site-footer__brand")).toBeNull();
    await render({ showBrand: false });
    expect(inner().className).toBe(footerInnerClassName(true, true, "green", false, false, false));
    expect(container.querySelector("summary")).toBe(trigger);
  });
});

test("English visitors keep one Accounts-confirmed label and fall back to the fixed label when it is unavailable", async () => {
  await fixture(async ({ render, container, window, requests }) => {
    const stored = new Map<string, string>([["hraness-site-footer:copy-arm:v1", "newsletter"]]);
    const assigns = () => requests.filter(request => request.url.endsWith("/api/mailing/experiment"));
    Object.defineProperty(window, "localStorage", { configurable: true, value: {
      getItem: (key: string) => stored.get(key) ?? "accepted", setItem: (key: string, value: string) => stored.set(key, value),
    } });
    await render({ attribution: true });
    const label = () => container.querySelector("summary > span")!.textContent;
    const title = () => container.querySelector("dialog h2")!.textContent;
    const disclosure = () => container.querySelector<HTMLElement>('[data-slot="hraness-mailing-disclosure"]')!;
    const token = () => container.querySelector<HTMLInputElement>('input[name="experimentToken"]')!;
    expect(label()).toBe("Subscribe to the newsletter");
    expect(title()).toBe("Subscribe to the newsletter");
    expect(disclosure().dataset.presentation).toBe("copy-modal-v1");
    expect(JSON.parse(String(assigns()[0]!.init.body))).toEqual({
      action: "assign", audience: "hraness", locale: "en", viewport: "wide", presentationVersion: "copy-modal-v1", copyArm: "newsletter",
    });
    const copy = copyEnvelope("newsletter");
    await act(async () => assigns()[0]!.resolve(Response.json(copy)));
    expect(token().disabled).toBeFalse();
    expect(token().value).toBe("c".repeat(64));
    // The arm and its unexpired token survive eligibility changes.
    await render({ attribution: false });
    await render({ attribution: true });
    expect(label()).toBe("Subscribe to the newsletter");
    expect(assigns()).toHaveLength(1);
    expect(token().value).toBe("c".repeat(64));
  });
  // A different arm from Accounts, or no confirmation, is never attributed to the rendered label.
  for (const response of [() => Response.json({ ...copyEnvelope("newsletter"), assignment: { ...copyEnvelope("newsletter").assignment, copyStyle: "product" } }), () => new Response(null, { status: 503 })]) {
    await fixture(async ({ render, container, window, requests }) => {
      Object.defineProperty(window, "localStorage", { configurable: true, value: {
        getItem: (key: string) => key === "hraness-site-footer:copy-arm:v1" ? "newsletter" : "accepted", setItem() {},
      } });
      const assigns = () => requests.filter(request => request.url.endsWith("/api/mailing/experiment"));
      await render({ attribution: true });
      await act(async () => assigns()[0]!.resolve(response()));
      expect(container.querySelector("summary > span")!.textContent).toBe("Get email updates");
      expect(container.querySelector("dialog h2")!.textContent).toBe("Get email updates");
      expect(container.querySelector<HTMLElement>('[data-slot="hraness-mailing-disclosure"]')!.dataset.presentation).toBe("stable-modal-v1");
      expect(container.querySelector<HTMLInputElement>('input[name="experimentToken"]')!.disabled).toBeTrue();
      expect(JSON.parse(String(assigns()[1]!.init.body)).presentationVersion).toBe("stable-modal-v1");
      await act(async () => assigns()[1]!.resolve(Response.json(fixed)));
      expect(container.querySelector<HTMLInputElement>('input[name="experimentToken"]')!.value).toBe("f".repeat(64));
    });
  }
});

test("default attribution skips Do Not Track, Global Privacy Control and automated browsers", async () => {
  for (const flag of [{ doNotTrack: "1" }, { webdriver: true }, { globalPrivacyControl: true }]) {
    await fixture(async ({ render, requests }) => {
      const saved = Object.keys(flag).map(key => [key, Object.getOwnPropertyDescriptor(navigator, key)] as const);
      for (const [key, value] of Object.entries(flag)) Object.defineProperty(navigator, key, { configurable: true, value });
      try {
        await render({}, true);
        expect(requests).toHaveLength(0);
        // An explicit host decision still applies.
        await render({ attribution: true });
        expect(requests.some(request => request.url.endsWith("/api/mailing/experiment"))).toBeTrue();
      } finally {
        for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(navigator, key, descriptor); else Reflect.deleteProperty(navigator, key); }
      }
    });
  }
  await fixture(async ({ render, requests }) => {
    await render({ mailingList: unnamed }, true);
    expect(JSON.parse(String(requests[0]!.init.body)).presentationVersion).toBe("stable-modal-v1");
  });
});

test("default attribution waits for cookie consent where the region requires it", async () => {
  await fixture(async ({ render, container, window, requests, click }) => {
    const stored = new Map<string, string>();
    Object.defineProperty(window, "localStorage", { configurable: true, value: {
      getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value),
    } });
    const assigns = () => requests.filter(request => request.url.endsWith("/api/mailing/experiment"));
    await render({ mailingList: unnamed }, true);
    expect(assigns()).toHaveLength(0);
    const region = requests.find(request => request.url.endsWith("/api/consent/region"))!;
    await act(async () => region.resolve(Response.json({ required: true })));
    expect(assigns()).toHaveLength(0);
    expect(stored.has("hraness-site-footer:copy-arm:v1")).toBeFalse();
    await click(container.querySelector('[data-slot="hraness-cookie-consent-accept"]')!);
    expect(assigns()).toHaveLength(1);
  });
});

test("a slow copy confirmation returns to the fixed label and token", async () => {
  await fixture(async ({ render, container, window, requests }) => {
    Object.defineProperty(window, "localStorage", { configurable: true, value: {
      getItem: (key: string) => key === "hraness-site-footer:copy-arm:v1" ? "product" : "accepted", setItem() {},
    } });
    const assigns = () => requests.filter(request => request.url.endsWith("/api/mailing/experiment"));
    await render({ attribution: true });
    expect(container.querySelector("summary > span")!.textContent).toBe("Get Hraness updates");
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 1_600)); });
    expect(assigns()[0]!.init.signal?.aborted).toBeTrue();
    expect(container.querySelector("summary > span")!.textContent).toBe("Get email updates");
    expect(JSON.parse(String(assigns()[1]!.init.body)).presentationVersion).toBe("stable-modal-v1");
  });
});
