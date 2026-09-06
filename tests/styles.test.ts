import { describe, expect, test } from "bun:test";
import { readStylexPackageManifest } from "@hraness/ui/stylex-build";
import { resolve } from "node:path";
import {
  footerClasses, footerClassName, footerInnerClassName, mailingStatusClassName, socialItemClassName,
} from "../src/footer.stylex.js";
import { assertPresentationBoundary, assertSourceBoundary } from "../scripts/check-stylex-artifacts.js";

const repository = resolve(import.meta.dir, "..");
const manifest = await readStylexPackageManifest(resolve(repository, "dist/stylex-manifest.json"), repository);
const rules = new Map(manifest.rules.map(([key, value]) => [key, value.ltr]));
function cssFor(classes: string): string {
  const atomic = classes.split(/\s+/u).filter((name) => name.startsWith("x"));
  expect(atomic.length).toBeGreaterThan(0);
  return atomic.map((name) => {
    expect(rules.has(name)).toBeTrue();
    return rules.get(name) ?? "";
  }).join("\n").replace(/\s+/gu, "");
}
function contains(classes: string, declaration: string): void {
  expect(cssFor(classes)).toContain(declaration.replace(/\s+/gu, ""));
}

describe("compiled footer presentation", () => {
  test("owns an in-flow responsive row and separate signup geometry", () => {
    const root = footerClassName(false);
    const signup = footerClassName(true);
    contains(root, "inline-size:100%");
    expect(cssFor(root)).not.toContain("position:fixed");
    expect(cssFor(root)).not.toMatch(/[{;]block-size:/u);
    contains(footerInnerClassName(false), "position:relative");
    contains(footerInnerClassName(false), 'grid-template-areas:"brand links"');
    contains(footerInnerClassName(true), 'grid-template-areas:"brand links" "mailing mailing"');
    contains(footerInnerClassName(true), 'grid-template-areas:"brand mailing links"');
    contains(footerInnerClassName(true), "@media (min-width:47.5rem)");
    contains(signup, "--hraness-site-footer-mailing-overlay-clearance:0rem");
    contains(signup, "--hraness-site-footer-content-block-size:max(var(--hraness-site-footer-social-target),var(--hraness-site-footer-form-block-size))");
    contains(footerInnerClassName(true), "block-size:var(--hraness-site-footer-bar-block-size)");
    for (const inset of ["left", "right", "bottom"]) contains(footerInnerClassName(true), `env(safe-area-inset-${inset})`);
  });

  test("preserves theme fallbacks, coarse targets, and root overrides", () => {
    contains(footerClassName(false), "var(--foreground,currentColor)");
    contains(footerClassName(false), "--hraness-site-footer-social-target:40px");
    contains(footerClassName(false), "--hraness-site-footer-social-target:44px");
    contains(footerClassName(false), "@media (pointer:coarse)");
    contains(footerClassName(false), "--hraness-site-footer-action-background:var(--plain-foreground,var(--foreground,CanvasText))");
    contains(footerClassName(false), "--hraness-site-footer-action-foreground:var(--plain-background,var(--background,Canvas))");
    expect(footerClassName(false).split(" ")[0]).toBe("hraness-site-footer");
  });

  test("keeps mobile social order and reveals each remaining owned item at its original threshold", () => {
    for (const index of [0, 1, 3, 6]) {
      const css = cssFor(socialItemClassName(index));
      expect(css).toContain("display:block");
      expect(css).not.toContain("display:none");
      expect(css).not.toContain("@container");
    }
    for (const [indexes, threshold] of [
      [[2, 4], 274], [[5, 7], 366], [[8, 9], 458], [[10], 504],
    ] as const) {
      for (const index of indexes) {
        contains(socialItemClassName(index), "display:none");
        contains(socialItemClassName(index), `@container hraness-footer-links (min-width:${threshold}px)`);
        contains(socialItemClassName(index), "display:block");
      }
    }
    contains(footerClasses.wordmark, "@container hraness-footer (min-width:44rem)");
    contains(footerClasses.wordmark, "@supports not (container-type:inline-size)");
    contains(footerClasses.links, "container-name:hraness-footer-links");
    contains(footerClasses.links, "container-type:inline-size");
  });

  test("preserves native focus, hover, disabled, reduced-motion, and forced-color behavior", () => {
    for (const classes of [footerClasses.brand, footerClasses.socialLink, footerClasses.mailingInput,
      footerClasses.mailingSubmit, footerClasses.mailingConfirmation, mailingStatusClassName("idle")]) {
      contains(classes, ":focus-visible");
      contains(classes, "outline-width:2px");
      contains(classes, "outline-offset:3px");
      contains(classes, "outline-color:Highlight");
    }
    contains(footerClasses.mailingSubmit, ":disabled");
    contains(footerClasses.mailingSubmit, "opacity:.62");
    contains(footerClasses.mailingSubmit, ":hover:not(:disabled)");
    contains(footerClasses.mailingSubmit, "opacity:.82");
    contains(footerClasses.mailingInput, "::placeholder");
    for (const classes of [footerClasses.brand, footerClasses.socialLink, footerClasses.mailingSubmit]) {
      contains(classes, "@media (hover:hover)");
      contains(classes, "@media (prefers-reduced-motion:no-preference)");
      contains(classes, "transition-duration:.12s");
    }
    contains(footerClasses.mailingSubmit, "background-color:ButtonText");
    contains(footerClasses.mailingSubmit, "color:ButtonFace");
    contains(footerInnerClassName(false), "background-color:Canvas");
  });

  test("keeps status and challenge overlays outside the reserved mailing row", () => {
    contains(mailingStatusClassName("idle"), "position:absolute");
    contains(mailingStatusClassName("idle"), "opacity:0");
    contains(mailingStatusClassName("idle"), "visibility:hidden");
    for (const state of ["pending", "error", "verification-error"]) {
      contains(mailingStatusClassName(state), "opacity:1");
      contains(mailingStatusClassName(state), "visibility:visible");
      expect(cssFor(mailingStatusClassName(state))).not.toContain("visibility:hidden");
    }
    for (const state of ["error", "verification-error"]) contains(mailingStatusClassName(state), "color:var(--hraness-site-footer-foreground)");
    contains(mailingStatusClassName("pending"), "color:var(--hraness-site-footer-muted)");
    contains(mailingStatusClassName("idle"), "inset-block-end:calc(100% + var(--hraness-site-footer-mailing-overlay-offset) + var(--hraness-site-footer-row-gap))");
    contains(footerClasses.turnstile, "inset-block-end:calc(100% + var(--hraness-site-footer-mailing-overlay-offset) + var(--hraness-site-footer-status-block-size) + var(--hraness-site-footer-row-gap) + var(--hraness-site-footer-row-gap))");
    for (const classes of [footerClasses.mailing, footerClasses.mailingConfirmation]) {
      contains(classes, "box-sizing:border-box");
      contains(classes, "inline-size:min(100%,26rem)");
      contains(classes, "block-size:var(--hraness-site-footer-form-block-size)");
    }
  });

  test("retains control shorthand resets and matching geometry", () => {
    for (const classes of [footerClasses.mailingInput, footerClasses.mailingSubmit]) {
      contains(classes, "block-size:var(--hraness-site-footer-control-block-size)");
      contains(classes, "font-family:inherit");
      contains(classes, "font-style:inherit");
      contains(classes, "font-language-override:inherit");
      contains(classes, "font-palette:inherit");
      contains(classes, "background-image:none");
      contains(classes, "background-origin:padding-box");
      contains(classes, "border-image-source:none");
    }
    contains(footerClasses.mailingInput, "border-top-left-radius:.375rem");
    contains(footerClasses.mailingSubmit, "border-top-right-radius:.375rem");
    contains(footerClasses.mailingSubmit, "margin-inline-start:-1px");
    contains(footerClasses.visuallyHidden, "clip-path:inset(50%)");
  });
});

describe("presentation boundary negative controls", () => {
  test("allows only the exact compatibility import and empty foundation", () => {
    expect(() => assertPresentationBoundary("styles.css", '@import "./dist/stylex.css";')).not.toThrow();
    expect(() => assertPresentationBoundary("compiler-foundation.css", "/* empty */")).not.toThrow();
    for (const mutation of [
      '.hraness-site-footer { display: block; }',
      '@layer components.hraness-site-footer.legacy { .hraness-site-footer { color: red; } }',
      '@import "./other.css";',
      '@import "./dist/stylex.css"; .unknown { display: none; }',
      '@import "./dist/stylex.css"; @import "./dist/stylex.css";',
    ]) expect(() => assertPresentationBoundary("styles.css", mutation)).toThrow();
    for (const mutation of ['@import "./dist/stylex.css";', ".theme { --color: red; }"]) {
      expect(() => assertPresentationBoundary("compiler-foundation.css", mutation)).toThrow();
    }
    expect(() => assertPresentationBoundary("src/restored.css", ".owned { color:red }")).toThrow();
  });

  test("rejects restored inline, HTML, imported, and relocated source presentation", () => {
    for (const mutation of [
      'const control = <input style={{ color: "red" }} />;',
      'const props = { style: { display: "none" } };',
      'const html = \'<div style="color:red"></div>\';',
      'import "./restored.css";',
      'node.style.color = "red";',
      'node.setAttribute("style", "color:red");',
      'const sheet = document.createElement("style");',
      'sheet.insertRule(".owned {color:red}");',
      'const styles = stylex.create({ root: { color: "red" } });',
    ]) expect(() => assertSourceBoundary("src/react.tsx", mutation)).toThrow();
  });
});
