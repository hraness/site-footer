import { expect, test } from "bun:test";
import { normalizeStylexSourceMap, verifyStylexSourceMap } from "../scripts/stylex-transform.js";

const debugId = "0123456789ABCDEF0123456789ABCDEF";
const transformed = new Map([["footer.stylex.ts", "const styles = {};"]]);
const source = JSON.stringify({
  version: 3,
  sources: ["../src/footer.stylex.ts"],
  sourcesContent: [transformed.get("footer.stylex.ts")],
  mappings: "AAAA",
  debugId,
});

test("external maps name exact compiler intermediates and retain their runtime association", () => {
  const normalized = normalizeStylexSourceMap(source, "fixture.map", transformed);
  expect(normalized.source).toContain("stylex-generated:///src/footer.stylex.ts");
  expect(normalized.source).toContain(debugId);
  expect(verifyStylexSourceMap(normalized.source, "fixture.map", transformed,
    `const styles = {};\n//# debugId=${debugId}\n`)).toEqual(["footer.stylex.ts"]);
});

test("external maps reject stale, missing, duplicate, and falsely attributed source evidence", () => {
  const normalized = normalizeStylexSourceMap(source, "fixture.map", transformed).source;
  for (const runtime of ["", "//# debugId=wrong", `//# debugId=${debugId}\n//# debugId=${debugId}`]) {
    expect(() => verifyStylexSourceMap(normalized, "fixture.map", transformed, runtime)).toThrow("debug ID");
  }
  expect(() => normalizeStylexSourceMap(source.replace(debugId, ""), "fixture.map", transformed)).toThrow("debug ID");
  expect(() => normalizeStylexSourceMap(source, "fixture.map", new Map([["footer.stylex.ts", "different"]])))
    .toThrow("exact transformed source");
  expect(() => verifyStylexSourceMap(source, "fixture.map", transformed, `//# debugId=${debugId}`))
    .toThrow("falsely claims");
});
