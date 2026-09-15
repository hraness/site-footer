import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { renderHranessSiteFooter } from "../src/index.js";
import { mailingStatusClassName } from "../src/footer.stylex.js";
import {
  renderHranessSiteFooterInnerHtml,
  type HranessMailingListConfig,
} from "../src/internal.js";
import { HranessSiteFooter } from "../src/react.js";

const noMailingList = { kind: "none" } as const satisfies HranessMailingListConfig;
const mailingList = {
  audience: "soundfish",
  kind: "signup",
} as const satisfies HranessMailingListConfig;

test("the idle React adapter renders identically to the static renderer", () => {
  const reactHtml = renderToStaticMarkup(
    <HranessSiteFooter mailingList={noMailingList} />,
  );
  expect(reactHtml).toBe(renderHranessSiteFooter({ mailingList: noMailingList }));
  expect(reactHtml.match(/id="hraness-site-footer"/gu)).toHaveLength(1);
  const signupHtml = renderToStaticMarkup(
    <HranessSiteFooter mailingList={mailingList} showBrand={false} />,
  );
  expect(signupHtml).toBe(renderHranessSiteFooter({
    mailingList,
    showBrand: false,
  }));
  expect(signupHtml).not.toContain("turnstile");
  expect(signupHtml).not.toContain("challenges.cloudflare.com");
  expect(signupHtml).toContain('name="audience" type="hidden" value="soundfish"');
  expect(signupHtml).toContain('name="website"');
  expect(signupHtml).toContain('type="submit">Send me things</button>');
  expect(signupHtml).not.toContain('data-slot="hraness-mark"');
  const social = {
    github: {
      href: "https://github.com/hraness/aicharts",
      label: "AI Charts on GitHub",
    },
    x: {
      href: "https://x.com/aichartsio",
      label: "AI Charts on X",
    },
  } as const;
  const reactSocialHtml = renderToStaticMarkup(
    <HranessSiteFooter mailingList={noMailingList} social={social} />,
  );
  expect(reactSocialHtml).toBe(renderHranessSiteFooter({
    mailingList: noMailingList,
    social,
  }));
  expect(reactSocialHtml).toContain('href="https://x.com/aichartsio"');
  expect(reactSocialHtml).toContain('aria-label="AI Charts on GitHub"');
  expect(reactSocialHtml).not.toContain("bsky.app");
});

test("the shared renderer bounds pending, accepted, and error states", () => {
  const idle = renderHranessSiteFooterInnerHtml(true, mailingList, { kind: "idle" });
  expect(idle).toContain('data-state="idle"');
  expect(idle).not.toContain("disabled");

  const pending = renderHranessSiteFooterInnerHtml(true, mailingList, {
    audience: "soundfish",
    email: "reader@example.com",
    kind: "pending",
  });
  expect(pending).toContain('data-state="pending"');
  expect(pending).toContain('aria-busy="true"');
  expect(pending).toContain('disabled=""');
  expect(pending).toContain(">Subscribing…</button>");
  expect(pending).toContain("Submitting your email…");
  expect(pending).toContain('value="reader@example.com"');

  const accepted = renderHranessSiteFooterInnerHtml(true, mailingList, {
    audience: "soundfish",
    kind: "accepted",
  });
  expect(accepted).not.toContain("<form");
  expect(accepted).toContain('data-state="accepted"');
  expect(accepted).toContain('aria-atomic="true"');
  expect(accepted).toContain('role="status"');
  expect(accepted).toContain("Check your email to confirm");

  const error = renderHranessSiteFooterInnerHtml(true, mailingList, {
    audience: "soundfish",
    email: 'reader+"retry"@example.com',
    kind: "error",
  });
  expect(error).toContain('data-state="error"');
  expect(error).toContain('aria-live="assertive"');
  expect(error).toContain('role="alert"');
  expect(error).toContain("Couldn't subscribe. Try again.");
  expect(error).toContain('value="reader+&quot;retry&quot;@example.com"');
});

test("a stale response state cannot leak across audience changes", () => {
  const html = renderHranessSiteFooterInnerHtml(true, {
    audience: "aicharts",
    kind: "signup",
  }, {
    audience: "soundfish",
    kind: "accepted",
  });

  expect(html).toContain('data-state="idle"');
  expect(html).toContain('name="audience" type="hidden" value="aicharts"');
  expect(html).not.toContain("Check your email to confirm");
});

test("the React adapter reveals geo-gated cookie consent and persists acceptance", async () => {
  const { window } = parseHTML('<main id="content"></main><div id="root"></div>');
  const overrides = {
    Comment: window.Comment,
    document: window.document,
    Element: window.Element,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    MutationObserver: window.MutationObserver,
    navigator: window.navigator,
    Node: window.Node,
    Text: window.Text,
    window,
  } as const;
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, value] of Object.entries(overrides)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    });
  }
  const actEnvironment = Object.getOwnPropertyDescriptor(
    globalThis,
    "IS_REACT_ACT_ENVIRONMENT",
  );
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    configurable: true,
    value: true,
    writable: true,
  });

  const storage = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, String(value)); },
    },
  });

  const originalFetch = globalThis.fetch;
  const requests: Array<Readonly<{ input: string | URL | Request; init?: RequestInit }>> = [];
  const regionResponses: Array<(response: Response) => void> = [];
  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    requests.push(init === undefined ? { input } : { init, input });
    if (String(input).includes("/api/consent/region")) {
      return new Promise<Response>((resolve) => {
        regionResponses.push(resolve);
      });
    }
    return new Promise<Response>(() => {});
  }) as typeof fetch;

  const container = window.document.querySelector<HTMLElement>("#root");
  expect(container).not.toBeNull();
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container!);

  try {
    await act(async () => {
      root.render(
        <HranessSiteFooter mailingList={noMailingList} experiment={false} />,
      );
    });

    const consent = container!.querySelector<HTMLElement>(
      '[data-slot="hraness-cookie-consent"]',
    );
    expect(consent).not.toBeNull();
    expect(consent!.hasAttribute("hidden")).toBeTrue();
    expect(requests.map((entry) => String(entry.input))).toContain(
      "https://account.hraness.com/api/consent/region",
    );
    expect(requests.find((entry) => String(entry.input).includes("consent"))?.init?.credentials)
      .toBe("omit");

    await act(async () => {
      regionResponses.forEach((resolve) => {
        resolve(Response.json({ region: "DE", required: true }));
      });
      await Promise.resolve();
      await Promise.resolve();
    });

    const revealed = container!.querySelector<HTMLElement>(
      '[data-slot="hraness-cookie-consent"]',
    );
    expect(revealed!.hasAttribute("hidden")).toBeFalse();

    await act(async () => {
      container!.querySelector<HTMLElement>(
        '[data-slot="hraness-cookie-consent-accept"]',
      )!.dispatchEvent(new window.Event("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(storage.get("hraness-consent-cookies-v1")).toBe("accepted");
    expect(
      container!.querySelector<HTMLElement>('[data-slot="hraness-cookie-consent"]')!.hasAttribute("hidden"),
    ).toBeTrue();
  } finally {
    await act(async () => {
      root.unmount();
    });
    globalThis.fetch = originalFetch;
    if (actEnvironment === undefined) {
      Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT");
    } else {
      Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", actEnvironment);
    }
    for (const [name, descriptor] of previous) {
      if (descriptor === undefined) Reflect.deleteProperty(globalThis, name);
      else Object.defineProperty(globalThis, name, descriptor);
    }
  }
});

test("the React adapter keeps consent hidden when already accepted", async () => {
  const { window } = parseHTML('<div id="root"></div>');
  const overrides = {
    Comment: window.Comment,
    document: window.document,
    Element: window.Element,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    MutationObserver: window.MutationObserver,
    navigator: window.navigator,
    Node: window.Node,
    Text: window.Text,
    window,
  } as const;
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, value] of Object.entries(overrides)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    });
  }
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    configurable: true,
    value: true,
    writable: true,
  });

  const storage = new Map<string, string>([["hraness-consent-cookies-v1", "accepted"]]);
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, String(value)); },
    },
  });

  const originalFetch = globalThis.fetch;
  const requests: Array<string> = [];
  globalThis.fetch = ((input: string | URL | Request) => {
    requests.push(String(input));
    return new Promise<Response>(() => {});
  }) as typeof fetch;

  const container = window.document.querySelector<HTMLElement>("#root");
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container!);

  try {
    await act(async () => {
      root.render(
        <HranessSiteFooter mailingList={noMailingList} experiment={false} />,
      );
      await Promise.resolve();
    });

    expect(
      container!.querySelector<HTMLElement>('[data-slot="hraness-cookie-consent"]')!.hasAttribute("hidden"),
    ).toBeTrue();
    expect(requests).not.toContain("https://account.hraness.com/api/consent/region");
  } finally {
    await act(async () => {
      root.unmount();
    });
    globalThis.fetch = originalFetch;
    for (const [name, descriptor] of previous) {
      if (descriptor === undefined) Reflect.deleteProperty(globalThis, name);
      else Object.defineProperty(globalThis, name, descriptor);
    }
  }
});

test("the React adapter shows consent when region detection fails", async () => {
  const { window } = parseHTML('<div id="root"></div>');
  const overrides = {
    Comment: window.Comment,
    document: window.document,
    Element: window.Element,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    MutationObserver: window.MutationObserver,
    navigator: window.navigator,
    Node: window.Node,
    Text: window.Text,
    window,
  } as const;
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, value] of Object.entries(overrides)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    });
  }
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    configurable: true,
    value: true,
    writable: true,
  });

  const storage = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, String(value)); },
    },
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => Promise.reject(new Error("offline"))) as unknown as typeof fetch;

  const container = window.document.querySelector<HTMLElement>("#root");
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container!);

  try {
    await act(async () => {
      root.render(
        <HranessSiteFooter mailingList={noMailingList} experiment={false} />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(
      container!.querySelector<HTMLElement>('[data-slot="hraness-cookie-consent"]')!.hasAttribute("hidden"),
    ).toBeFalse();
  } finally {
    await act(async () => {
      root.unmount();
    });
    globalThis.fetch = originalFetch;
    for (const [name, descriptor] of previous) {
      if (descriptor === undefined) Reflect.deleteProperty(globalThis, name);
      else Object.defineProperty(globalThis, name, descriptor);
    }
  }
});

test("the React adapter posts the native form, restores request focus, and confirms", async () => {
  const { window } = parseHTML('<a id="host-link" href="#content">Skip to content</a><main id="content"></main><div id="root"></div>');
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
    window,
  } as const;
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, value] of Object.entries(overrides)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value,
      writable: true,
    });
  }
  const actEnvironment = Object.getOwnPropertyDescriptor(
    globalThis,
    "IS_REACT_ACT_ENVIRONMENT",
  );
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    configurable: true,
    value: true,
    writable: true,
  });
  const activeElementDescriptor = Object.getOwnPropertyDescriptor(
    window.document,
    "activeElement",
  );
  const originalFocus = window.HTMLElement.prototype.focus;
  let activeElement: Element | null = null;
  Object.defineProperty(window.document, "activeElement", {
    configurable: true,
    get: () => activeElement,
  });
  window.HTMLElement.prototype.focus = function focus(this: HTMLElement) {
    activeElement = this;
  };

  const originalFetch = globalThis.fetch;
  let request:
    | Readonly<{
      input: string | URL | Request;
      init?: RequestInit;
    }>
    | undefined;
  let resolveRequest: ((response: Response) => void) | undefined;
  const mockFetch = (input: string | URL | Request, init?: RequestInit) => {
    request = init === undefined ? { input } : { init, input };
    return new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
  };
  globalThis.fetch = mockFetch as typeof fetch;

  const container = window.document.querySelector<HTMLElement>("#root");
  expect(container).not.toBeNull();
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container!);

  try {
    const hostLink = window.document.querySelector<HTMLElement>("#host-link");
    expect(hostLink).not.toBeNull();
    hostLink!.focus();
    await act(async () => {
      root.render(
        <HranessSiteFooter mailingList={mailingList} experiment={false} />,
      );
    });

    const form = container?.querySelector<HTMLFormElement>("form");
    const input = form?.querySelector<HTMLInputElement>('input[name="email"]');
    const honeypot = form?.querySelector<HTMLInputElement>('input[name="website"]');
    expect(form).not.toBeNull();
    expect(input).not.toBeNull();
    expect(honeypot).not.toBeNull();
    expect(form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBeFalse();
    expect(form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.textContent)
      .toBe("Send me things");
    expect(window.document.querySelectorAll("script")).toHaveLength(0);
    input!.value = "reader@example.com";

    await act(async () => {
      form!.dispatchEvent(new window.Event("submit", {
        bubbles: true,
        cancelable: true,
      }));
      await Promise.resolve();
    });

    expect(request?.input).toBe("https://account.hraness.com/api/mailing/subscribe");
    expect(request?.init?.method).toBe("POST");
    expect(request?.init?.credentials).toBe("omit");
    expect(request?.init?.headers).toEqual({ accept: "application/json" });
    const body = request?.init?.body;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("audience")).toBe("soundfish");
    expect((body as FormData).get("email")).toBe("reader@example.com");
    expect((body as FormData).get("source")).toBe("hraness-site-footer");
    expect((body as FormData).get("website")).toBe("");
    expect((body as FormData).get("cf-turnstile-response")).toBeNull();
    expect(container?.querySelector("form")?.getAttribute("data-state")).toBe("pending");
    expect(container?.textContent).toContain("Submitting your email…");
    expect(container?.querySelector('[data-slot="hraness-mailing-list-status"]')?.getAttribute("class"))
      .toBe(mailingStatusClassName("pending"));

    await act(async () => {
      resolveRequest?.({ ok: false } as Response);
      await Promise.resolve();
      await Promise.resolve();
    });

    const errorInput = container!.querySelector<HTMLInputElement>('input[name="email"]');
    const errorStatus = container!.querySelector<HTMLElement>('[role="alert"]');
    expect(errorInput?.value).toBe("reader@example.com");
    expect(errorStatus?.getAttribute("aria-live")).toBe("assertive");
    expect(errorStatus?.textContent).toBe("Couldn't subscribe. Try again.");
    expect(window.document.activeElement).toBe(errorInput);

    await act(async () => {
      container?.querySelector("form")?.dispatchEvent(new window.Event("submit", {
        bubbles: true,
        cancelable: true,
      }));
      await Promise.resolve();
    });

    await act(async () => {
      resolveRequest?.({ ok: true } as Response);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container?.querySelector("form")).toBeNull();
    expect(container?.querySelector('[data-state="accepted"]')?.textContent)
      .toBe("Check your email to confirm");
  } finally {
    await act(async () => {
      root.unmount();
    });
    globalThis.fetch = originalFetch;
    window.HTMLElement.prototype.focus = originalFocus;
    if (activeElementDescriptor === undefined) {
      Reflect.deleteProperty(window.document, "activeElement");
    } else {
      Object.defineProperty(window.document, "activeElement", activeElementDescriptor);
    }
    if (actEnvironment === undefined) {
      Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT");
    } else {
      Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", actEnvironment);
    }
    for (const [name, descriptor] of previous) {
      if (descriptor === undefined) Reflect.deleteProperty(globalThis, name);
      else Object.defineProperty(globalThis, name, descriptor);
    }
  }
});

test("eligible enrollment survives native submission but resize removes stale attribution without erasing email", async () => {
  const { window } = parseHTML('<div id="root"></div>');
  const changes = new Set<() => void>();
  const media = { matches: false, addEventListener: (_type: string, fn: () => void) => changes.add(fn), removeEventListener: (_type: string, fn: () => void) => changes.delete(fn) };
  Object.defineProperty(window, "matchMedia", { configurable: true, value: (query: string) => query === "(min-width: 47.5rem)" ? media : { matches: false, addEventListener() {}, removeEventListener() {} } });
  Object.defineProperty(window, "localStorage", { configurable: true, value: { getItem: () => "accepted" } });
  const requests: Array<{ action: string; audience?: string; locale?: string; presentationVersion?: number; viewport?: string }> = [];
  const token = "b".repeat(64);
  const overrides = {
    Comment: window.Comment, document: window.document, Element: window.Element, Event: window.Event,
    HTMLElement: window.HTMLElement, HTMLInputElement: window.HTMLInputElement, MutationObserver: window.MutationObserver,
    navigator: window.navigator, Node: window.Node, Text: window.Text, window, IS_REACT_ACT_ENVIRONMENT: true,
    fetch: (async (_input: unknown, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      requests.push(body);
      return Response.json({ version: 1, token, assignment: {
        id: "123e4567-e89b-42d3-a456-426614174000", locale: "en", layout: "button", copyStyle: "goblin",
        color: "green", shimmer: false, cohort: "explore", policyVersion: `footer-v2-${body.viewport}`,
      } });
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
    await act(async () => { root.render(<HranessSiteFooter mailingList={mailingList} locale="en" />); });
    const email = container.querySelector<HTMLInputElement>('input[name="email"]')!;
    const nativeToken = container.querySelector<HTMLInputElement>('input[name="experimentToken"]')!;
    expect(requests).toEqual([{ action: "assign", audience: "soundfish", locale: "en", presentationVersion: 2, viewport: "compact" }]);
    expect(nativeToken.value).toBe(token);
    expect(nativeToken.disabled).toBeFalse();
    expect(container.querySelector("summary")?.textContent).toBe("Feed the goblin");
    email.value = "do-not-erase@example.test";
    await act(async () => { email.dispatchEvent(new window.Event("focusin", { bubbles: true })); });
    await act(async () => { media.matches = true; changes.forEach(fn => fn()); });
    expect(container.querySelector('input[name="email"]')).toBe(email);
    expect(email.value).toBe("do-not-erase@example.test");
    expect(nativeToken.disabled).toBeTrue();
    expect(nativeToken.value).toBe("");
    expect(requests).toHaveLength(1);
    // A later parent render must not rebuild the now-unattributed active form.
    await act(async () => { root.render(<HranessSiteFooter mailingList={mailingList} locale="en" />); });
    expect(container.querySelector('input[name="email"]')).toBe(email);
    expect(email.value).toBe("do-not-erase@example.test");
    expect(nativeToken.disabled).toBeTrue();
  } finally {
    await act(async () => { root.unmount(); });
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
