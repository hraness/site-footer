import { expect, test } from "bun:test";
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseHTML } from "linkedom";
import { HranessCookieConsent } from "../src/react.js";

test("standalone consent is inert on the server and renders only the shared note", () => {
  const html = renderToStaticMarkup(<HranessCookieConsent />);
  const { document } = parseHTML(html);
  expect(document.querySelector("[data-slot=hraness-cookie-consent]")?.hasAttribute("hidden")).toBe(true);
  expect(document.querySelector("footer, form, .hraness-site-footer__brand, .hraness-site-footer__socials")).toBeNull();
  expect(document.querySelector("[data-slot=hraness-cookie-consent]")?.getAttribute("data-consent-placement")).toBe("corner");
  expect(renderToStaticMarkup(<HranessCookieConsent placement="flow" />)).toContain('data-consent-placement="flow"');
  expect(document.querySelector("summary")?.getAttribute("aria-label")).toBe("About cookies");
  expect(() => renderToStaticMarkup(<HranessCookieConsent placement={'invalid' as 'flow'} />)).toThrow("Consent placement");
  expect(html).not.toContain("Cookies keep you signed in");
  expect(renderToStaticMarkup(<HranessCookieConsent signIn />)).toContain("Cookies keep you signed in");
});

for (const required of [true, false]) {
  test(`standalone consent on a direct app-route mount: required=${required}`, async () => {
    const { window } = parseHTML('<html><body><div id="root"></div></body></html>');
    let stored: string | null = null;
    let signal: AbortSignal | null | undefined;
    Object.defineProperty(window, "localStorage", { configurable: true, value: {
      getItem: () => stored, setItem: (_key: string, value: string) => { stored = value; },
    } });
    const overrides = {
      window, document: window.document, navigator: window.navigator, Event: window.Event,
      Node: window.Node, Element: window.Element, HTMLElement: window.HTMLElement,
      IS_REACT_ACT_ENVIRONMENT: true,
      fetch: (async (_url: unknown, init?: RequestInit) => {
        signal = init?.signal;
        return Response.json({ required });
      }) as typeof fetch,
    };
    const originals = new Map<string, PropertyDescriptor | undefined>();
    for (const [key, value] of Object.entries(overrides)) {
      originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, value, writable: true });
    }
    const { createRoot } = await import("react-dom/client");
    const container = window.document.getElementById("root")!;
    const root = createRoot(container);
    let unmounted = false;
    let accepted = 0;
    window.addEventListener("hraness-consent-accepted", () => { accepted += 1; });
    try {
      await act(async () => root.render(<HranessCookieConsent signIn />));
      const note = container.querySelector("[data-slot=hraness-cookie-consent]")!;
      expect(note.hasAttribute("hidden")).toBe(false);
      expect(note.getAttribute("data-consent-state")).toBe(required ? "required" : "clear");
      if (required) {
        await act(async () => note.querySelector("button")!.dispatchEvent(new window.Event("click", { bubbles: true })));
        expect(stored as string | null).toBe("accepted");
        expect(accepted).toBe(1);
        expect(note.hasAttribute("hidden")).toBe(false);
        expect(note.querySelector("summary")?.getAttribute("aria-label")).toBe("Analytics preferences");
      }
      await act(async () => note.querySelector('[data-slot="hraness-cookie-consent-decline"]')!.dispatchEvent(new window.Event("click", { bubbles: true })));
      expect(stored as string | null).toBe("declined");
      expect(note.getAttribute("data-consent-state")).toBe("declined");
      expect(note.hasAttribute("hidden")).toBe(false);
      await act(async () => note.querySelector('details [data-slot="hraness-cookie-consent-accept"]')!.dispatchEvent(new window.Event("click", { bubbles: true })));
      expect(stored as string | null).toBe("accepted");
      expect(note.getAttribute("data-consent-state")).toBe("clear");
      await act(async () => root.unmount());
      unmounted = true;
      expect(signal?.aborted).toBe(true);
      note.querySelector("button")!.dispatchEvent(new window.Event("click", { bubbles: true }));
      expect(accepted).toBe(required ? 2 : 1);
    } finally {
      if (!unmounted) await act(async () => root.unmount());
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    }
  });
}
