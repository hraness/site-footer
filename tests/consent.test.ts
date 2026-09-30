import { expect, test } from "bun:test";
import { resolve } from "node:path";

for (const scenario of ["required", "permitted", "stored", "unavailable", "malformed", "blocked-storage", "race", "cleanup", "storage-change"]) {
  test(`static cookie consent: ${scenario}`, () => {
    const result = Bun.spawnSync([
      process.execPath,
      "./tests/fixtures/consent-browser.ts", scenario,
    ], { cwd: resolve(import.meta.dir, ".."), stdout: "pipe", stderr: "pipe" });
    expect(new TextDecoder().decode(result.stderr)).toBe("");
    expect(result.exitCode).toBe(0);
  });
}
