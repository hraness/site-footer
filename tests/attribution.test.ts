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

test("copy attribution echoes the rendered arm and admits only Accounts' confirmation of that arm", async () => {
  const { requestCopyFooterAttribution, FOOTER_COPY_ARMS } = await import("../src/attribution.js");
  const original = globalThis.fetch;
  const copy = (copyStyle: string) => ({ ...envelope(), assignment: { ...envelope().assignment, copyStyle, cohort: "explore", policyVersion: "copy-modal-v1" } });
  let payload: unknown;
  const requests: unknown[] = [];
  globalThis.fetch = (async (_url: unknown, init: RequestInit) => { requests.push(JSON.parse(String(init.body))); return Response.json(payload); }) as typeof fetch;
  try {
    for (const arm of FOOTER_COPY_ARMS) {
      payload = copy(arm);
      expect(await requestCopyFooterAttribution("hraness", "en", "wide", arm, new AbortController().signal))
        .toEqual({ token: "a".repeat(64), expiresAt: (payload as ReturnType<typeof envelope>).expiresAt });
      expect(requests.at(-1)).toEqual({ action: "assign", audience: "hraness", locale: "en", viewport: "wide", presentationVersion: "copy-modal-v1", copyArm: arm });
      for (const invalid of [
        copy(arm === "direct" ? "product" : "direct"), envelope(),
        { ...copy(arm), assignment: { ...copy(arm).assignment, cohort: "fixed" } },
        { ...copy(arm), assignment: { ...copy(arm).assignment, layout: "inline" } },
      ]) { payload = invalid; expect(await requestCopyFooterAttribution("hraness", "en", "wide", arm, new AbortController().signal)).toBeNull(); }
    }
    payload = copy("direct");
    expect(await requestStableFooterAttribution("hraness", "en", "wide", new AbortController().signal)).toBeNull();
  } finally { globalThis.fetch = original; }
});
