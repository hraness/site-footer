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
    /@media \(min-width: 760px\)[\s\S]*?--hraness-site-footer-content-block-size: max\([\s\S]*?grid-template-areas: "brand mailing links"/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer\[data-mailing-list="none"\] \.hraness-site-footer__inner \{[\s\S]*?grid-template-areas: "brand links";/u,
  );
});

test("the package owns a compact email field, adjacent action, and bounded status row", () => {
  expect(css).toMatch(
    /\.hraness-site-footer__mailing-controls \{[\s\S]*?display: flex;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing-input \{[\s\S]*?inline-size: 100%;[\s\S]*?border-radius: 0\.375rem 0 0 0\.375rem;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing-submit \{[\s\S]*?margin-inline-start: -1px;[\s\S]*?border-radius: 0 0\.375rem 0\.375rem 0;/u,
  );
  expect(css).toContain(
    "--hraness-site-footer-action-background: var(--plain-foreground, var(--foreground, CanvasText))",
  );
  expect(css).toContain(
    "--hraness-site-footer-action-foreground: var(--plain-background, var(--background, Canvas))",
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing-status \{[\s\S]*?block-size: var\(--hraness-site-footer-status-block-size\);[\s\S]*?text-overflow: ellipsis;/u,
  );
  expect(css).toContain(".hraness-site-footer__visually-hidden");
  expect(css).toMatch(
    /\.hraness-site-footer__turnstile \{[\s\S]*?position: absolute;[\s\S]*?inset-block-end: calc\(100% \+ 0\.5rem\);[\s\S]*?max-inline-size: 30rem;/u,
  );
});

test("the accepted state stays inside the narrow mailing-list geometry", () => {
  expect(css).toMatch(
    /\.hraness-site-footer__mailing,[\s\S]*?\.hraness-site-footer__mailing-confirmation,[\s\S]*?\.hraness-site-footer__mailing-status \{[\s\S]*?box-sizing: border-box;/u,
  );
  expect(css).toMatch(
    /\.hraness-site-footer__mailing,\n\.hraness-site-footer__mailing-confirmation \{[\s\S]*?inline-size: min\(100%, 30rem\);[\s\S]*?min-inline-size: 0;/u,
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
    /\.hraness-site-footer__socials > li:first-child,[\s\S]*?nth-child\(3\),[\s\S]*?nth-child\(6\) \{[\s\S]*?display: block;/u,
  );
  expect(css).toMatch(
    /@container hraness-footer \(min-width: 960px\)[\s\S]*?data-mailing-list="signup"[\s\S]*?nth-child\(-n \+ 6\)/u,
  );
  expect(css).toMatch(
    /@container hraness-footer \(min-width: 1280px\)[\s\S]*?data-mailing-list="signup"[\s\S]*?\.hraness-site-footer__socials > li/u,
  );
});

test("all rules remain scoped to the package footer", () => {
  expect(css).not.toMatch(/(^|\n)\s*(footer|form|a|button|input|nav|ul|li|svg)\s*\{/u);
});
