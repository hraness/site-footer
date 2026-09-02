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
    /@media \(pointer: coarse\)[\s\S]*?--hraness-site-footer-social-target: 44px;[\s\S]*?--hraness-site-footer-control-block-size:/u,
  );
});

test("the fixed bar reserves one row without signup and responsive space with signup", () => {
  expect(css).toContain("position: fixed");
  expect(css).toContain("inset-block-end: 0");
  expect(css).toContain("max-inline-size: none");
  expect(css).toContain("block-size: var(--hraness-site-footer-bar-block-size)");
  expect(css).toContain("background: var(--hraness-site-footer-background)");
  expect(css).toContain("env(safe-area-inset-bottom)");
  expect(css).toMatch(
    /\.hraness-site-footer\[data-mailing-list="signup"\] \{[\s\S]*?--hraness-site-footer-content-block-size: calc\([\s\S]*?--hraness-site-footer-form-block-size/u,
  );
  expect(css).toMatch(
    /@media \(min-width: 47\.5rem\)[\s\S]*?--hraness-site-footer-content-block-size: max\([\s\S]*?grid-template-areas: "brand mailing links"/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer\[data-mailing-list="none"\] \.hraness-site-footer__inner \{[\s\S]*?grid-template-areas: "brand links";/u,
  );
});

test("the package owns compact centered controls and a non-reserving status surface", () => {
  expect(css).toMatch(
    /--hraness-site-footer-mailing-overlay-clearance: calc\([\s\S]*?var\(--hraness-site-footer-control-block-size\)[\s\S]*?\+ var\(--hraness-site-footer-row-gap\)[\s\S]*?\);/u,
  );
  expect(css).toMatch(
    /--hraness-site-footer-mailing-overlay-offset: calc\([\s\S]*?var\(--hraness-site-footer-mailing-overlay-clearance\)[\s\S]*?\+ var\(--hraness-site-footer-padding-block\)[\s\S]*?\+ 1px/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing-controls \{[\s\S]*?display: flex;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing-input \{[\s\S]*?inline-size: 100%;[\s\S]*?border-radius: 0\.375rem 0 0 0\.375rem;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing-submit \{[\s\S]*?align-items: center;[\s\S]*?display: inline-flex;[\s\S]*?justify-content: center;[\s\S]*?line-height: 1;[\s\S]*?margin-inline-start: -1px;[\s\S]*?border-radius: 0 0\.375rem 0\.375rem 0;/u,
  );
  expect(css).toContain(
    "--hraness-site-footer-action-background: var(--plain-foreground, var(--foreground, CanvasText))",
  );
  expect(css).toContain(
    "--hraness-site-footer-action-foreground: var(--plain-background, var(--background, Canvas))",
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing-status \{[\s\S]*?position: absolute;[\s\S]*?inset-block-end: calc\([\s\S]*?100% \+ var\(--hraness-site-footer-mailing-overlay-offset\)[\s\S]*?\+ var\(--hraness-site-footer-row-gap\)[\s\S]*?\);[\s\S]*?background: var\(--hraness-site-footer-background\);[\s\S]*?opacity: 0;[\s\S]*?visibility: hidden;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing:not\(\[data-state="idle"\]\)[\s\S]*?\.hraness-site-footer__mailing-status \{[\s\S]*?opacity: 1;[\s\S]*?visibility: visible;/u,
  );
  expect(css).toContain(".hraness-site-footer__visually-hidden");
  expect(css).toMatch(
    /\.hraness-site-footer__turnstile \{[\s\S]*?position: absolute;[\s\S]*?inset-block-end: calc\([\s\S]*?100% \+ var\(--hraness-site-footer-mailing-overlay-offset\)[\s\S]*?\+ var\(--hraness-site-footer-status-block-size\)[\s\S]*?\+ var\(--hraness-site-footer-row-gap\)[\s\S]*?\+ var\(--hraness-site-footer-row-gap\)[\s\S]*?\);[\s\S]*?max-inline-size: 26rem;/u,
  );
  expect(css).toMatch(
    /@media \(min-width: 47\.5rem\)[\s\S]*?\.hraness-site-footer\[data-mailing-list="signup"\] \{[\s\S]*?--hraness-site-footer-mailing-overlay-clearance: 0rem;/u,
  );
  expect(css).toContain(
    '.hraness-site-footer__mailing[data-state="verification-error"] .hraness-site-footer__mailing-status',
  );
});

test("the accepted state stays inside the narrow mailing-list geometry", () => {
  expect(css).toMatch(
    /\.hraness-site-footer__mailing,[\s\S]*?\.hraness-site-footer__mailing-confirmation,[\s\S]*?\.hraness-site-footer__mailing-status,[\s\S]*?\.hraness-site-footer__turnstile \{[\s\S]*?box-sizing: border-box;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing,\n\.hraness-site-footer__mailing-confirmation \{[\s\S]*?inline-size: min\(100%, 26rem\);[\s\S]*?min-inline-size: 0;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing-confirmation \{[\s\S]*?border: 1px solid[\s\S]*?padding-inline: 0\.75rem;/u,
  );
});

test("social links keep their canonical mobile subset and reveal later around signup", () => {
  expect(css).toContain("--hraness-site-footer-social-target: 40px");
  expect(css).toMatch(
    /\.hraness-site-footer__wordmark \{[\s\S]*?display: none;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__socials > li \{[\s\S]*?display: none;[\s\S]*?flex: 0 0 var\(--hraness-site-footer-social-target\);/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__socials > li:first-child,[\s\S]*?nth-child\(2\),[\s\S]*?nth-child\(4\),[\s\S]*?nth-child\(7\) \{[\s\S]*?display: block;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__links \{[\s\S]*?container-name: hraness-footer-links;[\s\S]*?container-type: inline-size;[\s\S]*?inline-size: 100%;/u,
  );
  expect(css).toMatch(
    /@container hraness-footer-links \(min-width: 274px\)[\s\S]*?nth-child\(-n \+ 5\)/u,
  );
  expect(css).toMatch(
    /@container hraness-footer-links \(min-width: 366px\)[\s\S]*?nth-child\(-n \+ 8\)/u,
  );
  expect(css).toMatch(
    /@container hraness-footer-links \(min-width: 458px\)[\s\S]*?nth-child\(-n \+ 10\)/u,
  );
  expect(css).toMatch(
    /@container hraness-footer-links \(min-width: 504px\)[\s\S]*?\.hraness-site-footer__socials > li/u,
  );
  expect(css).not.toMatch(/min-width: (?:704|760|768|832|960|1120|1280)px/u);
});

test("all rules remain scoped to the package footer", () => {
  expect(css).not.toMatch(/(^|\n)\s*(footer|form|a|button|input|nav|ul|li|svg)\s*\{/u);
});
