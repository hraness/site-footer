import { expect, test } from "bun:test";

const css = await Bun.file(new URL("../styles.css", import.meta.url)).text();

test("the stylesheet keeps responsive, coarse-pointer, focus, and forced-color contracts", () => {
  expect(css).toContain("container-type: inline-size");
  expect(css).toContain("@container hraness-footer");
  expect(css).toContain("@media (pointer: coarse)");
  expect(css).toContain(":focus-visible");
  expect(css).toContain("@media (forced-colors: active)");
  expect(css).toContain("env(safe-area-inset-left)");
  expect(css).toContain("var(--foreground, currentColor)");
  expect(css).toMatch(
    /@media \(pointer: coarse\)[\s\S]*?\.hraness-site-footer__brand,[\s\S]*?\.hraness-site-footer__newsletter/u,
  );
});

test("the footer is a full-width persistent bar with a matching flow reservation", () => {
  expect(css).toContain("position: fixed");
  expect(css).toContain("inset-block-end: 0");
  expect(css).toContain("max-inline-size: none");
  expect(css).toContain("block-size: var(--hraness-site-footer-bar-block-size)");
  expect(css).toContain("--hraness-site-footer-control-block-size: max(var(--hraness-site-footer-social-target), 2.25rem)");
  expect(css).toContain("background: var(--hraness-site-footer-background)");
  expect(css).toContain("env(safe-area-inset-bottom)");
});

test("mobile shows only X and wider containers progressively reveal one social row", () => {
  expect(css).toContain("--hraness-site-footer-social-target: 40px");
  expect(css).toMatch(
    /\.hraness-site-footer__wordmark \{[\s\S]*?display: none;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__socials > li \{[\s\S]*?display: none;[\s\S]*?flex: 0 0 var\(--hraness-site-footer-social-target\);/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__socials > li:first-child \{[\s\S]*?display: block;/u,
  );
  expect(css).toMatch(
    /@container hraness-footer \(min-width: 704px\)[\s\S]*?\.hraness-site-footer__wordmark \{[\s\S]*?display: inline;[\s\S]*?nth-child\(-n \+ 6\)/u,
  );
  expect(css).toMatch(
    /@container hraness-footer \(min-width: 768px\)[\s\S]*?nth-child\(-n \+ 8\)/u,
  );
  expect(css).toMatch(
    /@container hraness-footer \(min-width: 832px\)[\s\S]*?\.hraness-site-footer__socials > li/u,
  );
  expect(css).toMatch(
    /@media \(pointer: coarse\)[\s\S]*?\.hraness-site-footer \{[\s\S]*?--hraness-site-footer-social-target: 44px;/u,
  );
  expect(css).not.toContain("grid-template-rows");
});

test("all rules remain scoped to the package footer", () => {
  expect(css).not.toMatch(/(^|\n)\s*(footer|a|nav|ul|li|svg)\s*\{/u);
});
