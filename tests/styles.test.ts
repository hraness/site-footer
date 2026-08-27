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
    /@media \(pointer: coarse\)[\s\S]*?\.hraness-site-footer__brand,[\s\S]*?\.hraness-site-footer__newsletter/u,
  );
});

test("ten social links form a compact five-column by two-row grid", () => {
  expect(css).toContain("padding-block: clamp(0.375rem, 1vw, 0.625rem)");
  expect(css).toMatch(
    /\.hraness-site-footer__socials \{[\s\S]*?display: grid;[\s\S]*?grid-template-columns: repeat\(5, var\(--hraness-site-footer-social-target\)\);[\s\S]*?grid-template-rows: repeat\(2, var\(--hraness-site-footer-social-target\)\);/u,
  );
  expect(css).toMatch(
    /@media \(pointer: coarse\)[\s\S]*?\.hraness-site-footer__socials \{[\s\S]*?--hraness-site-footer-social-target: 2\.75rem;/u,
  );
});

test("all rules remain scoped to the package footer", () => {
  expect(css).not.toMatch(/(^|\n)\s*(footer|a|nav|ul|li|svg)\s*\{/u);
});
