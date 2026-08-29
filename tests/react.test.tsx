import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { renderHranessSiteFooter } from "../src/index.js";
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

test("the idle React adapter renders the exact static contract", () => {
  const reactHtml = renderToStaticMarkup(
    <HranessSiteFooter mailingList={noMailingList} />,
  );
  expect(reactHtml).toBe(renderHranessSiteFooter({ mailingList: noMailingList }));
  expect(reactHtml.match(/id="hraness-site-footer"/gu)).toHaveLength(1);
  expect(renderToStaticMarkup(
    <HranessSiteFooter mailingList={mailingList} showBrand={false} />,
  )).toBe(renderHranessSiteFooter({ mailingList, showBrand: false }));
});

test("the shared renderer bounds pending, accepted, and error states", () => {
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

test("the React adapter progressively posts, restores error focus, and confirms", async () => {
  const { window } = parseHTML('<div id="root"></div>');
  const overrides = {
    Comment: window.Comment,
    document: window.document,
    Element: window.Element,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
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
    await act(async () => {
      root.render(<HranessSiteFooter mailingList={mailingList} />);
    });

    const form = container?.querySelector<HTMLFormElement>("form");
    const input = form?.querySelector<HTMLInputElement>('input[name="email"]');
    expect(form).not.toBeNull();
    expect(input).not.toBeNull();
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
    expect(container?.querySelector("form")?.getAttribute("data-state")).toBe("pending");
    expect(container?.textContent).toContain("Submitting your email…");

    await act(async () => {
      resolveRequest?.({ ok: false } as Response);
      await Promise.resolve();
      await Promise.resolve();
    });

    const errorInput = container!.querySelector<HTMLInputElement>('input[name="email"]');
    const errorStatus = container!.querySelector<HTMLElement>('[role="alert"]');
    expect(errorInput?.value).toBe("reader@example.com");
    expect(errorStatus?.getAttribute("aria-live")).toBe("assertive");
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
