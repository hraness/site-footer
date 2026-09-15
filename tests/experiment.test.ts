import { expect, test } from "bun:test";
import { DEFAULT_FOOTER_VARIANT, parseFooterEnrollment, parseFooterVariant, isFooterEnrollmentEligible, requestFooterEnrollment } from "../src/experiment.js";

const id = "123e4567-e89b-42d3-a456-426614174000";
const token = "a".repeat(64);

test("accepts only bounded Accounts enrollment values", () => {
  const parsed = parseFooterEnrollment({ version: 1, token, assignment: {
    id, locale: "es-AR", layout: "button", copyStyle: "inviting", color: "orange", shimmer: true,
    cohort: "explore", policyVersion: "footer-v1",
  }});
  expect(parsed?.assignment.layout).toBe("button");
  expect(parseFooterEnrollment({ version: 1, token: "not-a-token", assignment: {} })).toBeNull();
  expect(parseFooterEnrollment({ version: 1, token, assignment: { id: "bad" } })).toBeNull();
});

test("validates explicit static variants", () => {
  expect(parseFooterVariant(DEFAULT_FOOTER_VARIANT)).toEqual(DEFAULT_FOOTER_VARIANT);
  expect(() => parseFooterVariant({ ...DEFAULT_FOOTER_VARIANT, color: "purple" })).toThrow();
});


test("keeps compact assignments button-only and rejects historical or untranslated recipes", () => {
  const enrollment = { version: 1 as const, token, assignment: {
    id, locale: "en", layout: "button" as const, copyStyle: "goblin" as const, color: "green" as const,
    shimmer: false, cohort: "explore" as const, policyVersion: "footer-v2-compact",
  } };
  expect(parseFooterEnrollment(enrollment)).not.toBeNull();
  const wideInline = { ...enrollment, assignment: { ...enrollment.assignment, layout: "inline" as const, policyVersion: "footer-v2-wide" } };
  expect(isFooterEnrollmentEligible(wideInline, "en", "wide", false)).toBeFalse();
  expect(isFooterEnrollmentEligible(wideInline, "en", "wide", true)).toBeTrue();
  expect(isFooterEnrollmentEligible(enrollment, "en", "compact")).toBeTrue();
  expect(isFooterEnrollmentEligible({ ...enrollment, assignment: { ...enrollment.assignment, shimmer: true } }, "en", "compact")).toBeFalse();
  expect(isFooterEnrollmentEligible({ ...enrollment, assignment: { ...enrollment.assignment, color: "blue" } }, "en", "compact")).toBeFalse();
  expect(isFooterEnrollmentEligible({ ...enrollment, assignment: { ...enrollment.assignment, layout: "inline" } }, "en", "compact")).toBeFalse();
  expect(isFooterEnrollmentEligible({ ...enrollment, assignment: { ...enrollment.assignment, policyVersion: "footer-v1" } }, "en", "wide")).toBeFalse();
  expect(isFooterEnrollmentEligible({ ...enrollment, assignment: { ...enrollment.assignment, locale: "es-AR" } }, "es-AR", "compact")).toBeFalse();
});

test("enrollment explicitly requests presentation version and viewport cohort without credentials", async () => {
  const previous = globalThis.fetch;
  let request: RequestInit | undefined;
  globalThis.fetch = (async (_input, init) => { request = init; return new Response(null, { status: 204 }); }) as typeof fetch;
  try {
    await requestFooterEnrollment("hraness", "en", new AbortController().signal, "compact");
    expect(JSON.parse(String(request?.body))).toEqual({ action: "assign", audience: "hraness", locale: "en", presentationVersion: 2, viewport: "compact" });
    expect(request?.credentials).toBe("omit");
  } finally { globalThis.fetch = previous; }
});
