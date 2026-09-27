import { describe, expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { renderHranessSiteFooter, type HranessMailingListConfig } from "../src/index.js";
import { normalizeHranessPageUrl, parseHranessPageUrl } from "../src/internal.js";
import { HranessSiteFooter } from "../src/react.js";

const mailingList = { audience: "hraness", kind: "signup" } as const satisfies HranessMailingListConfig;

function formInputs(html: string) {
  const { document } = parseHTML(html);
  const form = document.querySelector('form[data-slot="hraness-mailing-list-signup"]');
  return {
    page: form?.querySelector<HTMLInputElement>('input[name="page"]') ?? null,
    placement: form?.querySelector<HTMLInputElement>('input[name="placement"]') ?? null,
  };
}

/** Deterministic xorshift generator so failures reproduce from the seed. */
function generator(seed: number) {
  let state = seed >>> 0 || 1;
  return (limit: number) => {
    state ^= state << 13; state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5; state >>>= 0;
    return state % limit;
  };
}

const PAGE_ALPHABET = "abcXYZ019-._~!$&'()*+,;=:@/?#%20 éß<>\"`";

describe("signup page and placement fields", () => {
  test("server markup sends the route's origin and path with a footer placement", () => {
    const { page, placement } = formInputs(renderHranessSiteFooter({
      mailingList,
      pageUrl: "https://hraness.com/valhalla?utm_source=x&email=reader%40example.com#top",
    }));
    expect(page?.getAttribute("type")).toBe("hidden");
    expect(page?.getAttribute("value")).toBe("https://hraness.com/valhalla");
    expect(page?.hasAttribute("disabled")).toBeFalse();
    expect(placement?.getAttribute("type")).toBe("hidden");
    expect(placement?.getAttribute("value")).toBe("footer");
  });

  test("an unknown page is disabled so native posts omit it", () => {
    const html = renderHranessSiteFooter({ mailingList });
    const { page, placement } = formInputs(html);
    expect(page?.getAttribute("value")).toBe("");
    expect(page?.hasAttribute("disabled")).toBeTrue();
    expect(placement?.getAttribute("value")).toBe("footer");
    expect(html).toContain('name="placement" type="hidden" value="footer"');
  });

  test("account and no-control footers render no signup fields", () => {
    for (const kind of ["account", "none"] as const) {
      const html = renderHranessSiteFooter({ mailingList: { kind }, pageUrl: "https://hraness.com/" });
      expect(html).not.toContain('name="page"');
      expect(html).not.toContain('name="placement"');
    }
  });

  test("React server rendering matches the static renderer with a page", () => {
    const pageUrl = "https://hraness.com/music/valhalla?ref=1";
    expect(renderToStaticMarkup(<HranessSiteFooter mailingList={mailingList} pageUrl={pageUrl} />))
      .toBe(renderHranessSiteFooter({ mailingList, pageUrl }));
  });

  test("rejects relative, non-web, and credentialed page URLs", () => {
    for (const pageUrl of ["/valhalla", "", "javascript:alert(1)", "mailto:reader@example.com", "https://reader:secret@hraness.com/", `https://hraness.com/${"a".repeat(2048)}`]) {
      expect(() => renderHranessSiteFooter({ mailingList, pageUrl })).toThrow(TypeError);
    }
    expect(parseHranessPageUrl(undefined)).toBeUndefined();
    expect(parseHranessPageUrl("HTTPS://Hraness.COM:443/a b")).toBe("https://hraness.com/a%20b");
  });

  test("no normalized or rendered page value ever carries a query or fragment", () => {
    const next = generator(0x5eed);
    for (let run = 0; run < 2000; run++) {
      let path = "";
      for (let index = next(40); index > 0; index--) path += PAGE_ALPHABET[next(PAGE_ALPHABET.length)];
      const origin = ["https://hraness.com", "http://localhost:3000", "https://xn--bcher-kva.example"][next(3)];
      const candidate = `${origin}/${path}`;
      const page = normalizeHranessPageUrl(candidate);
      if (page === null) continue;
      expect(page).not.toMatch(/[?#]/u);
      expect(page.startsWith(`${new URL(candidate).origin}/`)).toBeTrue();
      const rendered = formInputs(renderHranessSiteFooter({ mailingList, pageUrl: candidate })).page?.getAttribute("value") ?? "";
      expect(rendered).toBe(page);
      expect(rendered).not.toMatch(/[?#]/u);
    }
  });
});

test("the React adapter follows client navigation and submits the current page", async () => {
  const { window } = parseHTML('<div id="root"></div>');
  const navigation = new window.EventTarget();
  const location = { href: "https://hraness.com/valhalla?utm_source=x#top" };
  const overrides = {
    Comment: window.Comment,
    document: window.document,
    Element: window.Element,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    HTMLFormElement: window.HTMLFormElement,
    HTMLInputElement: window.HTMLInputElement,
    MutationObserver: window.MutationObserver,
    navigator: window.navigator,
    Node: window.Node,
    Text: window.Text,
    location,
    window,
  } as const;
  Object.defineProperty(window, "navigation", { configurable: true, value: navigation });
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, value] of Object.entries(overrides)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, value, writable: true });
  }
  const actEnvironment = Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT");
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", { configurable: true, value: true, writable: true });
  const originalFetch = globalThis.fetch;
  const bodies: FormData[] = [];
  globalThis.fetch = ((_input: string | URL | Request, init?: RequestInit) => {
    if (init?.body instanceof FormData) bodies.push(init.body);
    return new Promise<Response>(() => {});
  }) as typeof fetch;

  const container = window.document.querySelector<HTMLElement>("#root")!;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container);
  const page = () => container.querySelector<HTMLInputElement>('input[name="page"]')!;
  try {
    await act(async () => {
      root.render(<HranessSiteFooter mailingList={mailingList} pageUrl="https://hraness.com/valhalla" />);
    });
    expect(page().value).toBe("https://hraness.com/valhalla");
    expect(page().disabled).toBeFalse();
    expect(container.querySelector<HTMLInputElement>('input[name="placement"]')?.value).toBe("footer");

    // A host layout that never re-renders the footer still follows history.
    location.href = "https://hraness.com/music/ahoy?email=reader%40example.com#comments";
    await act(async () => { navigation.dispatchEvent(new window.Event("currententrychange")); });
    expect(page().value).toBe("https://hraness.com/music/ahoy");

    location.href = "https://hraness.com/notes#section";
    await act(async () => { window.dispatchEvent(new window.Event("popstate")); });
    expect(page().value).toBe("https://hraness.com/notes");

    // A navigation no event announced is still caught at submit time.
    location.href = "https://hraness.com/pricing?plan=pro";
    container.querySelector<HTMLInputElement>('input[name="email"]')!.value = "reader@example.com";
    await act(async () => {
      container.querySelector("form")!.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });
    expect(page().value).toBe("https://hraness.com/pricing");
    expect(bodies).toHaveLength(1);
    expect(bodies[0]!.get("page")).toBe("https://hraness.com/pricing");
    expect(bodies[0]!.get("placement")).toBe("footer");
    for (const value of bodies[0]!.values()) expect(String(value)).not.toMatch(/[?#]/u);
  } finally {
    await act(async () => { root.unmount(); });
    globalThis.fetch = originalFetch;
    if (actEnvironment === undefined) Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT");
    else Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", actEnvironment);
    for (const [name, descriptor] of previous) {
      if (descriptor === undefined) Reflect.deleteProperty(globalThis, name);
      else Object.defineProperty(globalThis, name, descriptor);
    }
  }
});

test("without a page prop or web location the React form omits page but keeps placement", async () => {
  const { window } = parseHTML('<div id="root"></div>');
  const overrides = {
    Comment: window.Comment, document: window.document, Element: window.Element, Event: window.Event,
    HTMLElement: window.HTMLElement, HTMLFormElement: window.HTMLFormElement, HTMLInputElement: window.HTMLInputElement,
    MutationObserver: window.MutationObserver, navigator: window.navigator, Node: window.Node, Text: window.Text,
    location: { href: "file:///tmp/index.html" }, window,
  } as const;
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, value] of Object.entries(overrides)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, value, writable: true });
  }
  const actEnvironment = Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT");
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", { configurable: true, value: true, writable: true });
  const originalFetch = globalThis.fetch;
  const bodies: FormData[] = [];
  globalThis.fetch = ((_input: string | URL | Request, init?: RequestInit) => {
    if (init?.body instanceof FormData) bodies.push(init.body);
    return new Promise<Response>(() => {});
  }) as typeof fetch;
  const container = window.document.querySelector<HTMLElement>("#root")!;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container);
  try {
    await act(async () => { root.render(<HranessSiteFooter mailingList={mailingList} />); });
    expect(container.querySelector<HTMLInputElement>('input[name="page"]')!.disabled).toBeTrue();
    container.querySelector<HTMLInputElement>('input[name="email"]')!.value = "reader@example.com";
    await act(async () => {
      container.querySelector("form")!.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });
    expect(bodies[0]!.has("page")).toBeFalse();
    expect(bodies[0]!.get("placement")).toBe("footer");
  } finally {
    await act(async () => { root.unmount(); });
    globalThis.fetch = originalFetch;
    if (actEnvironment === undefined) Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT");
    else Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", actEnvironment);
    for (const [name, descriptor] of previous) {
      if (descriptor === undefined) Reflect.deleteProperty(globalThis, name);
      else Object.defineProperty(globalThis, name, descriptor);
    }
  }
});
