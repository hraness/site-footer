import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act, useLayoutEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HranessSiteFooter } from "../src/react.js";
import { HRANESS_ACCOUNT_URL, renderHranessSiteFooter, type SupportProfile } from "../src/index.js";
import { FOOTER_LOCALES } from "../src/locales.js";

const signup = { kind: "signup", audience: "soundfish" } as const;
const account = { kind: "account" } as const;
const token = "c".repeat(64);
const enrollment = { version: 1, token, assignment: {
  id: "123e4567-e89b-42d3-a456-426614174000", locale: "en", layout: "button", copyStyle: "goblin",
  color: "green", shimmer: false, cohort: "explore", policyVersion: "footer-v3-compact",
} };

test("account state is a localized native link without any signup presentation", () => {
  expect(HRANESS_ACCOUNT_URL).toBe("https://account.hraness.com/");
  for (const locale of Object.values(FOOTER_LOCALES)) {
    const html = renderHranessSiteFooter({ mailingList: account, locale: locale.locale });
    expect(renderToStaticMarkup(<HranessSiteFooter mailingList={account} locale={locale.locale} />)).toBe(html);
    const { document } = parseHTML(html);
    const link = document.querySelector('[data-slot="hraness-account-link"]')!;
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe(HRANESS_ACCOUNT_URL);
    expect(link.getAttribute("target")).toBeNull();
    expect(link.textContent).toBe(locale.accountLabel);
    expect(locale.accountLabel.trim().length).toBeGreaterThan(0);
    expect(link.getAttribute("dir")).toBe(locale.dir);
    expect(link.getAttribute("lang")).toBe(locale.locale);
    expect(document.querySelector('form, input, [data-foil], [data-copy-variant], [data-layout], [data-shimmer]')).toBeNull();
    expect(document.querySelectorAll('nav[aria-label="Hraness links"] a')).toHaveLength(4);
  }
  expect(FOOTER_LOCALES.en?.accountLabel).toBe("My account");
  expect(FOOTER_LOCALES["es-AR"]?.accountLabel).toBe("Mi cuenta");
  expect(FOOTER_LOCALES.ar?.accountLabel).toBe("حسابي");
});

async function withFooter(run: (context: {
  container: HTMLElement;
  window: ReturnType<typeof parseHTML>["window"];
  render: (mode: "signup" | "account" | "none", experiment?: boolean, support?: SupportProfile) => Promise<void>;
  requests: Array<{ url: string; init: RequestInit; body: Record<string, unknown> | null }>;
  visible: () => void;
  queuedResize: () => void;
  respond: (response: () => Promise<Response>) => void;
  detach: (duringLayout: () => void) => Promise<void>;
}) => Promise<void>) {
  const { window } = parseHTML('<div id="root"></div>');
  const mediaCallbacks: Array<() => void> = [];
  Object.defineProperty(window, "matchMedia", { configurable: true, value: (query: string) => ({ matches: false,
    addEventListener(_type: string, callback: () => void) { if (query === "(min-width: 47.5rem)") mediaCallbacks.push(callback); },
    removeEventListener() {},
  }) });
  Object.defineProperty(window, "localStorage", { configurable: true, value: { getItem: () => "accepted" } });
  Object.defineProperty(window.document, "visibilityState", { configurable: true, value: "visible" });
  let intersect: IntersectionObserverCallback | undefined;
  let response = async () => Response.json(enrollment);
  const requests: Array<{ url: string; init: RequestInit; body: Record<string, unknown> | null }> = [];
  const overrides = {
    Comment: window.Comment, document: window.document, Element: window.Element, Event: window.Event,
    HTMLElement: window.HTMLElement, HTMLInputElement: window.HTMLInputElement, MutationObserver: window.MutationObserver,
    navigator: window.navigator, Node: window.Node, Text: window.Text, window, IS_REACT_ACT_ENVIRONMENT: true,
    IntersectionObserver: class {
      constructor(callback: IntersectionObserverCallback) { intersect = callback; }
      observe() {} disconnect() {}
    },
    fetch: (async (input: unknown, init: RequestInit = {}) => {
      requests.push({ url: String(input), init, body: typeof init.body === "string" ? JSON.parse(init.body) : null });
      return response();
    }) as typeof fetch,
  };
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries(overrides)) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  const { createRoot } = await import("react-dom/client");
  const container = window.document.querySelector<HTMLElement>("#root")!;
  const root = createRoot(container);
  try {
    await run({ container, window, requests,
      render: async (mode, experiment = true, support) => { await act(async () => root.render(
        <HranessSiteFooter mailingList={mode === "signup" ? signup : { kind: mode }} locale="en" experiment={experiment} {...(support === undefined ? {} : { support })} />,
      )); },
      queuedResize: () => mediaCallbacks.forEach(callback => callback()),
      visible: () => intersect?.([{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry], {} as IntersectionObserver),
      respond: (next) => { response = next; },
      detach: async (duringLayout) => {
        function Replacement() { useLayoutEffect(duringLayout, []); return null; }
        await act(async () => root.render(<Replacement />));
      },
    });
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}

test("account and loading modes never enroll; late assignments cannot restore signup", async () => {
  await withFooter(async ({ render, requests, respond, container, queuedResize }) => {
    await render("none");
    await render("account");
    expect(requests).toHaveLength(0);
    let resolve!: (response: Response) => void;
    respond(() => new Promise<Response>((done) => { resolve = done; }));
    await render("signup");
    expect(requests[0]?.body?.action).toBe("assign");
    await render("account");
    expect(requests[0]?.init.signal?.aborted).toBeTrue();
    queuedResize();
    expect(requests).toHaveLength(1);
    await act(async () => { resolve(Response.json(enrollment)); });
    expect(container.querySelector('[data-slot="hraness-account-link"]')?.textContent).toBe("My account");
    expect(container.querySelector("form")).toBeNull();
    respond(async () => Response.json(enrollment));
    await render("signup");
    expect(requests).toHaveLength(2);
    expect(container.querySelector('input[name="experimentToken"]')?.getAttribute("value")).toBe(token);
  });
});

test("session refresh disables native attribution without replacing typed email or firing queued exposure", async () => {
  await withFooter(async ({ render, requests, container, window, visible }) => {
    await render("signup");
    const email = container.querySelector<HTMLInputElement>('input[name="email"]')!;
    const nativeToken = container.querySelector<HTMLInputElement>('input[name="experimentToken"]')!;
    email.value = "preserve@example.test";
    await act(async () => email.dispatchEvent(new window.Event("focusin", { bubbles: true })));
    visible();
    await render("signup", false);
    expect(container.querySelector('input[name="email"]')).toBe(email);
    expect(nativeToken.disabled).toBeTrue();
    expect(nativeToken.value).toBe("");
    // Even an already-delivered observer callback cannot schedule valid attribution.
    visible();
    await new Promise(resolve => setTimeout(resolve, 450));
    expect(requests.map(({ body }) => body?.action)).toEqual(["assign"]);
    await render("signup", true);
    expect(container.querySelector('input[name="email"]')).toBe(email);
    expect(email.value).toBe("preserve@example.test");
    expect(nativeToken.disabled).toBeTrue();
    expect(requests).toHaveLength(1);
    await render("account");
    expect(container.querySelector("input")).toBeNull();
  });
});

test("account transition aborts in-flight exposure and submission, ignoring late success", async () => {
  await withFooter(async ({ render, requests, respond, container, window, visible }) => {
    await render("signup");
    const completions: Array<(response: Response) => void> = [];
    respond(() => new Promise(resolve => completions.push(resolve)));
    visible();
    await new Promise(resolve => setTimeout(resolve, 450));
    expect(requests[1]?.body?.action).toBe("expose");
    container.querySelector<HTMLInputElement>('input[name="email"]')!.value = "fixture@example.test";
    await act(async () => { container.querySelector("form")!.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })); });
    expect(requests[2]?.url).toEndWith("/api/mailing/subscribe");
    await render("account");
    expect(requests[1]?.init.signal?.aborted).toBeTrue();
    expect(requests[2]?.init.signal?.aborted).toBeTrue();
    await act(async () => { completions.forEach(resolve => resolve(new Response(null, { status: 202 }))); });
    expect(container.querySelector('[data-slot="hraness-account-link"]')?.textContent).toBe("My account");
    expect(container.querySelector('[data-state="accepted"]')).toBeNull();
  });
});


test("keyed unmount cancels tracking during commit before passive cleanup", async () => {
  await withFooter(async ({ render, requests, respond, visible, detach }) => {
    await render("signup");
    respond(() => new Promise<Response>(() => {}));
    visible();
    await new Promise(resolve => setTimeout(resolve, 450));
    expect(requests[1]?.body?.action).toBe("expose");
    await detach(() => {
      expect(requests[0]?.init.signal?.aborted).toBeTrue();
      expect(requests[1]?.init.signal?.aborted).toBeTrue();
      visible();
    });
    await new Promise(resolve => setTimeout(resolve, 450));
    expect(requests).toHaveLength(2);
  });
});


test("support-only updates preserve the active native signup form and disclosure", async () => {
  await withFooter(async ({ render, requests, container }) => {
    await render("signup", false);
    const input = container.querySelector<HTMLInputElement>('input[name="email"]')!;
    const disclosure = container.querySelector<HTMLElement>('[data-slot="hraness-mailing-disclosure"]')!;
    input.value = "keep@example.test";
    disclosure.setAttribute("open", "");
    const profile: SupportProfile = { id: "soundfish", name: "Soundfish", updates: true, valueProposition: "Support browser music tools." };
    for (const next of [profile, { ...profile, valueProposition: "Fund ongoing music-tool development." }, { ...profile, id: "wrench", name: "Ghostget" }, undefined]) {
      await render("signup", false, next);
      expect(container.querySelector('input[name="email"]')).toBe(input);
      expect(input.value).toBe("keep@example.test");
      expect(container.querySelector('[data-slot="hraness-mailing-disclosure"]')).toBe(disclosure);
      expect(disclosure.hasAttribute("open")).toBe(true);
      const link = container.querySelector('[data-slot="hraness-support-link"]');
      if (next) {
        expect(link?.getAttribute("href")).toBe(`https://account.hraness.com/support?product=${next.id}&source=web#support`);
        expect(link?.getAttribute("title")).toContain(next.valueProposition);
      } else expect(link).toBeNull();
    }
    expect(requests).toHaveLength(0);
  });
});
