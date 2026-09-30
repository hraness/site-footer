import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { renderHranessSiteFooter } from "../../dist/index.js";
import { HRANESS_CONSENT_STORAGE_KEY, initHranessCookieConsent } from "../../dist/consent.js";

const scenario = process.argv[2];
const { document, Event: DomEvent } = parseHTML(renderHranessSiteFooter({ mailingList: { kind: "none" } }));
const browser = new EventTarget();
let stored: string | null = scenario === "stored" || scenario === "storage-change" ? "accepted" : null;
Object.defineProperty(browser, "localStorage", { value: {
  getItem: (key: string) => { assert.equal(key, HRANESS_CONSENT_STORAGE_KEY); if (scenario === "blocked-storage") throw new Error("storage disabled"); return stored; },
  setItem: (key: string, value: string) => { assert.equal(key, HRANESS_CONSENT_STORAGE_KEY); if (scenario === "blocked-storage") throw new Error("storage disabled"); stored = value; },
} });
Object.defineProperty(globalThis, "window", { value: browser, configurable: true });
let calls = 0;
let signal: AbortSignal | null | undefined;
let resolveRegion: ((value: Response) => void) | undefined;
const originalFetch = globalThis.fetch;
globalThis.fetch = (async (url: RequestInfo | URL, options?: RequestInit) => {
  calls += 1;
  assert.equal(url, "https://account.hraness.com/api/consent/region");
  assert.equal(options?.credentials, "omit");
  assert.equal(options?.cache, "no-store");
  signal = options?.signal;
  if (scenario === "race" || scenario === "cleanup") return new Promise<Response>(resolve => { resolveRegion = resolve; });
  if (scenario === "unavailable") throw new Error("offline");
  return Response.json(scenario === "malformed" ? { required: "false" } : { required: scenario !== "permitted" });
}) as typeof fetch;
const note = document.querySelector('[data-slot="hraness-cookie-consent"]')!;
const button = note.querySelector('button')!;
let acceptedEvents = 0;
browser.addEventListener("hraness-consent-accepted", () => { acceptedEvents += 1; });
const cleanup = initHranessCookieConsent(document as unknown as Document);
const flush = async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve(); };
try {
  if (scenario === "cleanup") {
    cleanup();
    assert.equal(signal?.aborted, true);
    resolveRegion!(Response.json({ required: true }));
    await flush();
    button.dispatchEvent(new DomEvent("click", { bubbles: true }));
    assert.equal(acceptedEvents, 0);
    assert.equal(note.hasAttribute("hidden"), true);
  } else if (scenario === "race") {
    button.dispatchEvent(new DomEvent("click", { bubbles: true }));
    resolveRegion!(Response.json({ required: true }));
    await flush();
    assert.equal(acceptedEvents, 1);
    assert.equal(note.hasAttribute("hidden"), true);
  } else if (scenario === "storage-change") {
    assert.equal(calls, 0);
    stored = "refused";
    const event = new Event("storage");
    Object.defineProperty(event, "key", { value: HRANESS_CONSENT_STORAGE_KEY });
    browser.dispatchEvent(event);
    assert.equal(note.hasAttribute("hidden"), false);
  } else {
    await flush();
    assert.equal(note.hasAttribute("hidden"), scenario === "stored" || scenario === "permitted");
    assert.equal(calls, scenario === "stored" ? 0 : 1);
    if (scenario === "required" || scenario === "blocked-storage") {
      button.dispatchEvent(new DomEvent("click", { bubbles: true }));
      assert.equal(acceptedEvents, 1);
      assert.equal(note.hasAttribute("hidden"), true);
      assert.equal(stored, scenario === "blocked-storage" ? null : "accepted");
      cleanup();
      button.dispatchEvent(new DomEvent("click", { bubbles: true }));
      assert.equal(acceptedEvents, 1);
    }
  }
} finally { cleanup(); globalThis.fetch = originalFetch; }
