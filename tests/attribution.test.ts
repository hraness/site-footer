import { expect, test } from "bun:test";
import { requestStableFooterAttribution } from "../src/attribution.js";

const envelope = () => ({ version: 1, token: "a".repeat(64), expiresAt: Date.now() + 48 * 60 * 60 * 1000, assignment: {
  id: "123e4567-e89b-42d3-a456-426614174000", locale: "en", layout: "button", copyStyle: "direct", color: "green",
  shimmer: false, cohort: "fixed", policyVersion: "stable-modal-v1", viewport: "wide",
} });

test("fixed attribution admits only a bounded, unexpired matching scope without legacy recipes", async () => {
  const original = globalThis.fetch;
  let payload: unknown = envelope();
  const requests: unknown[] = [];
  globalThis.fetch = (async (_url: unknown, init: RequestInit) => {
    requests.push(JSON.parse(String(init.body)));
    return Response.json(payload);
  }) as typeof fetch;
  try {
    const request = () => requestStableFooterAttribution("hraness", "en", "wide", new AbortController().signal);
    expect((await request())?.token).toBe("a".repeat(64));
    expect(requests[0]).toEqual({ action: "assign", audience: "hraness", locale: "en", viewport: "wide", presentationVersion: "stable-modal-v1" });
    for (const invalid of [
      { ...envelope(), expiresAt: Date.now() + 1000 },
      { ...envelope(), expiresAt: Number.MAX_SAFE_INTEGER },
      { ...envelope(), expiresAt: "never" },
      { ...envelope(), token: "bad" },
      ...[ ["locale", "fr"], ["viewport", "compact"], ["layout", "inline"], ["copyStyle", "goblin"], ["cohort", "explore"], ["policyVersion", "footer-v3-wide"] ]
        .map(([key, value]) => ({ ...envelope(), assignment: { ...envelope().assignment, [key!]: value } })),
      { ...envelope(), padding: "x".repeat(2048) },
    ]) { payload = invalid; expect(await request()).toBeNull(); }
    globalThis.fetch = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;
    expect(await request()).toBeNull();
  } finally { globalThis.fetch = original; }
});
