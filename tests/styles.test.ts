import { expect, test } from "bun:test";

const css = await Bun.file(new URL("../styles.css", import.meta.url)).text();

test("the stylesheet keeps responsive, coarse-pointer, focus, and forced-color contracts", () => {
  expect(css).toContain("@media (max-width: 44rem)");
  expect(css).toContain("@media (pointer: coarse)");
  expect(css).toContain(":focus-visible");
  expect(css).toContain("@media (forced-colors: active)");
  expect(css).toContain("env(safe-area-inset-left)");
  expect(css).toContain("var(--foreground, currentColor)");
  expect(css).toMatch(
    /@media \(pointer: coarse\)[\s\S]*?\.hraness-site-footer__brand,[\s\S]*?\.hraness-site-footer__newsletter,[\s\S]*?\.hraness-site-footer__social-link/u,
  );
});

test("all rules remain scoped to the package footer", () => {
  expect(css).not.toMatch(/(^|\n)\s*(footer|a|nav|ul|li|svg)\s*\{/u);
});
