import { expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { renderHranessSiteFooter } from "../src/index.js";
import { mailingStatusClassName } from "../src/footer.stylex.js";
import {
  HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL,
  HRANESS_TURNSTILE_SCRIPT_URL,
  renderHranessSiteFooterInnerHtml,
  type HranessMailingListConfig,
} from "../src/internal.js";
import { HranessSiteFooter } from "../src/react.js";

const noMailingList = { kind: "none" } as const satisfies HranessMailingListConfig;
const TURNSTILE_TEST_SITEKEY = "1x00000000000000000000AA";
const TURNSTILE_SCRIPT_NONCE = "dGVzdC1ub25jZS0xMjM0";
const mailingList = {
  audience: "soundfish",
  kind: "signup",
  turnstileSitekey: TURNSTILE_TEST_SITEKEY,
} as const satisfies HranessMailingListConfig;

test("the idle React adapter preserves content while selecting explicit Turnstile rendering", () => {
  const reactHtml = renderToStaticMarkup(
    <HranessSiteFooter mailingList={noMailingList} />,
  );
  expect(reactHtml).toBe(renderHranessSiteFooter({ mailingList: noMailingList }));
  expect(reactHtml.match(/id="hraness-site-footer"/gu)).toHaveLength(1);
  const signupHtml = renderToStaticMarkup(
    <HranessSiteFooter mailingList={mailingList} showBrand={false} />,
  );
  const normalizedStaticHtml = renderHranessSiteFooter({
    mailingList,
    showBrand: false,
  })
    .replace(' cf-turnstile"', '"')
    .replace(
      'data-slot="hraness-mailing-list-signup-submit" type="submit">Subscribe</button>',
      'data-slot="hraness-mailing-list-signup-submit" type="submit" aria-disabled="true" disabled="">Verifying…</button>',
    )
    .replace(
      `<script async="" data-slot="hraness-turnstile-script" defer="" src="${HRANESS_TURNSTILE_SCRIPT_URL}"></script>`,
      "",
    );
  expect(signupHtml).toBe(normalizedStaticHtml);
  expect(signupHtml).toContain('data-slot="hraness-turnstile-widget"');
  expect(signupHtml).not.toContain(' cf-turnstile"');
  expect(signupHtml).not.toContain("challenges.cloudflare.com/turnstile/v0/api.js");
  expect(signupHtml).toContain('name="audience" type="hidden" value="soundfish"');
  expect(signupHtml).toContain('disabled="">Verifying…</button>');
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
  const verifying = renderHranessSiteFooterInnerHtml(
    true,
    mailingList,
    { kind: "idle" },
    "explicit",
  );
  expect(verifying).toContain('aria-disabled="true" disabled=""');
  expect(verifying).toContain(">Verifying…</button>");

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

  const verificationError = renderHranessSiteFooterInnerHtml(true, mailingList, {
    audience: "soundfish",
    email: "reader@example.com",
    kind: "verification-error",
  });
  expect(verificationError).toContain('data-state="verification-error"');
  expect(verificationError).toContain('aria-live="assertive"');
  expect(verificationError).toContain("Security check failed. Try again.");

  const explicitVerificationError = renderHranessSiteFooterInnerHtml(
    true,
    mailingList,
    {
      audience: "soundfish",
      email: "reader@example.com",
      kind: "verification-error",
    },
    "explicit",
  );
  expect(explicitVerificationError).toContain(">Retry check</button>");
  expect(explicitVerificationError).not.toContain(
    'type="submit" aria-disabled="true" disabled="">Retry check',
  );
});

test("a stale response state cannot leak across audience changes", () => {
  const html = renderHranessSiteFooterInnerHtml(true, {
    audience: "aicharts",
    kind: "signup",
    turnstileSitekey: TURNSTILE_TEST_SITEKEY,
  }, {
    audience: "soundfish",
    kind: "accepted",
  });

  expect(html).toContain('data-state="idle"');
  expect(html).toContain('name="audience" type="hidden" value="aicharts"');
  expect(html).not.toContain("Check your email to confirm");
});

test("the React adapter preserves background focus, retries Turnstile, gates posts, restores request focus, and confirms", async () => {
  const { window } = parseHTML('<a id="host-link" href="#content">Skip to content</a><main id="content"></main><div id="root"></div>');
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

  type MockTurnstileOptions = Readonly<{
    action: string;
    appearance: string;
    callback: (token: string) => void;
    "error-callback": (errorCode?: string) => void;
    "expired-callback": () => void;
    "refresh-expired": string;
    execution: string;
    "response-field-name": string;
    retry: string;
    sitekey: string;
  }>;
  let latestTurnstileOptions: MockTurnstileOptions | undefined;
  const renderedWidgets: string[] = [];
  const removedWidgets: string[] = [];
  const resetWidgets: string[] = [];
  const mockTurnstile = {
    remove(widget: string) {
      removedWidgets.push(widget);
    },
    render(_container: HTMLElement, options: MockTurnstileOptions) {
      latestTurnstileOptions = options;
      const widget = `widget-${renderedWidgets.length + 1}`;
      renderedWidgets.push(widget);
      return widget;
    },
    reset(widget: string) {
      resetWidgets.push(widget);
      latestTurnstileOptions?.callback(`refreshed-${widget}`);
    },
  };

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
        <HranessSiteFooter
          mailingList={mailingList}
          experiment={false}
          turnstileScriptNonce={TURNSTILE_SCRIPT_NONCE}
        />,
      );
    });

    const form = container?.querySelector<HTMLFormElement>("form");
    const input = form?.querySelector<HTMLInputElement>('input[name="email"]');
    expect(form).not.toBeNull();
    expect(input).not.toBeNull();
    expect(form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBeTrue();
    expect(form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.textContent)
      .toBe("Verifying…");
    input!.value = "reader@example.com";

    await act(async () => {
      form!.dispatchEvent(new window.Event("submit", {
        bubbles: true,
        cancelable: true,
      }));
      await Promise.resolve();
    });

    expect(request).toBeUndefined();
    expect(container?.querySelector("form")?.getAttribute("data-state"))
      .toBe("idle");
    expect(container?.textContent).not.toContain("Security check failed. Try again.");
    let scripts = window.document.querySelectorAll<HTMLScriptElement>(
      `script[src="${HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL}"]`,
    );
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.getAttribute("nonce")).toBe(TURNSTILE_SCRIPT_NONCE);

    // A blocked initial script is a background failure, not an invitation to
    // redirect keyboard navigation away from the containing page.
    await act(async () => {
      scripts[0]?.dispatchEvent(new window.Event("error"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(window.document.activeElement).toBe(hostLink);
    expect(request).toBeUndefined();
    expect(input?.value).toBe("reader@example.com");
    expect(form?.getAttribute("data-state")).toBe("verification-error");
    expect(container?.textContent).toContain("Security check failed. Try again.");
    expect(form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBeFalse();
    expect(form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.textContent)
      .toBe("Retry check");
    expect(window.document.querySelectorAll(
      `script[src="${HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL}"]`,
    )).toHaveLength(0);

    await act(async () => {
      form!.dispatchEvent(new window.Event("submit", {
        bubbles: true,
        cancelable: true,
      }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(request).toBeUndefined();
    expect(window.document.activeElement).toBe(hostLink);
    expect(form?.getAttribute("data-state")).toBe("idle");
    expect(form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBeTrue();
    expect(form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.textContent)
      .toBe("Verifying…");
    scripts = window.document.querySelectorAll<HTMLScriptElement>(
      `script[src="${HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL}"]`,
    );
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.getAttribute("nonce")).toBe(TURNSTILE_SCRIPT_NONCE);

    Object.defineProperty(window, "turnstile", {
      configurable: true,
      value: mockTurnstile,
      writable: true,
    });
    await act(async () => {
      scripts[0]?.dispatchEvent(new window.Event("load"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(window.document.querySelectorAll(
      `script[src="${HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL}"]`,
    )).toHaveLength(1);
    expect(renderedWidgets).toHaveLength(1);
    expect(latestTurnstileOptions?.sitekey).toBe(TURNSTILE_TEST_SITEKEY);
    expect(latestTurnstileOptions?.action).toBe("mailing_soundfish");
    expect(latestTurnstileOptions?.appearance).toBe("interaction-only");
    expect(latestTurnstileOptions?.execution).toBe("render");
    expect(latestTurnstileOptions?.["refresh-expired"]).toBe("auto");
    expect(latestTurnstileOptions?.retry).toBe("auto");
    expect(latestTurnstileOptions?.["response-field-name"])
      .toBe("cf-turnstile-response");
    expect(container?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBeTrue();
    const firstTurnstileOptions = latestTurnstileOptions;
    expect(firstTurnstileOptions).toBeDefined();

    await act(async () => {
      root.render(
        <HranessSiteFooter
          mailingList={mailingList}
          experiment={false}
          showBrand={false}
          turnstileScriptNonce={TURNSTILE_SCRIPT_NONCE}
        />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(renderedWidgets).toHaveLength(2);
    expect(removedWidgets).toContain("widget-1");
    expect(container?.querySelector('[data-slot="hraness-mark"]')).toBeNull();
    await act(async () => {
      firstTurnstileOptions?.callback("stale-widget-1-token");
      await Promise.resolve();
    });
    expect(container?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBeTrue();
    const toggledInput = container?.querySelector<HTMLInputElement>('input[name="email"]');
    expect(toggledInput).not.toBeNull();
    toggledInput!.value = "reader@example.com";
    hostLink!.focus();

    await act(async () => {
      latestTurnstileOptions?.["error-callback"]("110200");
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(request).toBeUndefined();
    expect(window.document.activeElement).toBe(hostLink);
    expect(toggledInput?.value).toBe("reader@example.com");
    expect(container?.querySelector("form")?.getAttribute("data-state"))
      .toBe("verification-error");
    expect(container?.textContent).toContain("Security check failed. Try again.");
    expect(container?.querySelector('[data-slot="hraness-mailing-list-status"]')?.getAttribute("class"))
      .toBe(mailingStatusClassName("verification-error"));
    expect(renderedWidgets).toHaveLength(2);
    expect(container?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBeFalse();
    expect(container?.querySelector<HTMLButtonElement>('button[type="submit"]')?.textContent)
      .toBe("Retry check");

    await act(async () => {
      container?.querySelector("form")?.dispatchEvent(new window.Event("submit", {
        bubbles: true,
        cancelable: true,
      }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(request).toBeUndefined();
    expect(container?.querySelector("form")?.getAttribute("data-state")).toBe("idle");
    expect(container?.textContent).not.toContain("Security check failed. Try again.");
    expect(container?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBeTrue();
    expect(renderedWidgets).toHaveLength(3);
    expect(removedWidgets).toContain("widget-2");
    expect(container?.querySelector('[data-slot="hraness-mailing-list-status"]')?.getAttribute("class"))
      .toBe(mailingStatusClassName("idle"));

    await act(async () => {
      latestTurnstileOptions?.callback("token-widget-3");
      await Promise.resolve();
    });
    expect(container?.querySelector("form")?.getAttribute("data-state")).toBe("idle");
    expect(container?.textContent).not.toContain("Security check failed. Try again.");
    expect(container?.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled)
      .toBeFalse();
    expect(container?.querySelector<HTMLButtonElement>('button[type="submit"]')?.textContent)
      .toBe("Subscribe");

    await act(async () => {
      root.render(
        <HranessSiteFooter
          mailingList={{ ...mailingList }}
          experiment={false}
          showBrand={false}
          turnstileScriptNonce={TURNSTILE_SCRIPT_NONCE}
        />,
      );
      await Promise.resolve();
    });
    expect(renderedWidgets).toHaveLength(3);

    const verifiedForm = container?.querySelector<HTMLFormElement>("form");
    expect(verifiedForm).not.toBeNull();

    await act(async () => {
      verifiedForm!.dispatchEvent(new window.Event("submit", {
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
    expect((body as FormData).get("cf-turnstile-response")).toBe("token-widget-3");
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
    expect(window.document.activeElement).toBe(errorInput);

    await act(async () => {
      latestTurnstileOptions?.["expired-callback"]();
      await Promise.resolve();
    });
    const latestRenderedWidget = renderedWidgets.at(-1);
    expect(latestRenderedWidget).toBeDefined();
    expect(resetWidgets).toContain(latestRenderedWidget!);

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
    expect(removedWidgets.length).toBeGreaterThan(0);
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
