import { expect, test } from "bun:test";
import { DEFAULT_FOOTER_VARIANT, parseFooterEnrollment, parseFooterVariant } from "../src/experiment.js";

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
