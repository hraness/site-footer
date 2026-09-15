import { describe, expect, test } from "bun:test";
import { createStylexTransformCollector, readStylexPackageManifest } from "@hraness/ui/stylex-build";
import { resolve } from "node:path";
import {
  disclosureClassNames, footerClasses, footerClassName, footerInnerClassName, mailingStatusClassName, socialItemClassName,
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
  test("binds the fail-fast compiler without widening standalone runtime dependencies", async () => {
    const pkg = await Bun.file(new URL("../package.json", import.meta.url)).json();
    expect(pkg.version).toBe("0.10.1");
    expect(pkg.devDependencies["@hraness/ui"]).toBe("github:hraness/ui#v0.5.12");
    expect(pkg.peerDependencies).toEqual({ react: ">=18 <20" });
    expect(pkg.peerDependenciesMeta).toEqual({ react: { optional: true } });
    expect(pkg.dependencies).toBeUndefined();
    expect(manifest.compiler.transform.propertyValidationMode).toBe("throw");
    expect(manifest.compilerSha256).toBe("9ac2c8448ec8f198047e824ce27a97657e05025918c01c204aa0399f94641049");
  });

  test("rejects an unsupported logical shorthand before admitting any recipe rules", async () => {
    const collector = createStylexTransformCollector(repository);
    await expect(collector.transform(`import * as stylex from "@stylexjs/stylex";
      export const styles = stylex.create({ footer: {
        color: "red", borderBlockStart: "1px solid currentColor",
      } });`, resolve(repository, "src/footer-validation-fixture.stylex.ts"))).rejects.toThrow(/not supported/u);
    expect(collector.seal()).toEqual([]);
  });

  test("owns a sticky responsive row and separate signup geometry", () => {
    const root = footerClassName(false);
    const signup = footerClassName(true);
    contains(root, "inline-size:100%");
    contains(root, "min-block-size:var(--hraness-site-footer-bar-block-size)");
    expect(cssFor(root)).not.toMatch(/[{;]block-size:/u);
    contains(footerInnerClassName(false), "position:fixed");
    contains(footerInnerClassName(false), 'grid-template-areas:"brand consent links"');
    contains(footerInnerClassName(true), 'grid-template-areas:"brand mailing links"');
    contains(footerInnerClassName(true), 'grid-template-areas:"brand mailing consent links"');
    contains(footerInnerClassName(true), "@media (min-width:47.5rem)");
    contains(signup, "--hraness-site-footer-mailing-overlay-clearance:0rem");
    contains(signup, "--hraness-site-footer-content-block-size:max(var(--hraness-site-footer-social-target),var(--hraness-site-footer-form-block-size))");
    contains(footerInnerClassName(true), "min-block-size:var(--hraness-site-footer-bar-block-size)");
    for (const inset of ["left", "right"]) contains(footerInnerClassName(true), `env(safe-area-inset-${inset})`);
    contains(footerInnerClassName(true), "env(safe-area-inset-bottom, 0px)");
  });

  test("preserves theme fallbacks, coarse targets, and root overrides", () => {
    contains(footerClassName(false), "var(--foreground,currentColor)");
    contains(footerClassName(false), "--hraness-site-footer-social-target:1.75rem");
    contains(footerClassName(false), "--hraness-site-footer-social-target:44px");
    contains(footerClassName(false), "@media (pointer:coarse)");
    contains(footerClassName(false), "--hraness-site-footer-action-background:var(--plain-foreground,var(--foreground,CanvasText))");
    contains(footerClassName(false), "--hraness-site-footer-action-foreground:var(--plain-background,var(--background,Canvas))");
    expect(footerClassName(false).split(" ")[0]).toBe("hraness-site-footer");
  });

  test("keeps Substack visible and progressively reveals later social targets", () => {
    const css = cssFor(socialItemClassName());
    expect(css).toContain("display:block");
    expect(css).not.toContain("display:none");
    expect(css).not.toContain("@container");
    for (const index of [1, 2, 3]) {
      expect(cssFor(socialItemClassName(index))).toContain("display:none");
      expect(cssFor(socialItemClassName(index))).toContain("@container hraness-socials".replaceAll(" ", ""));
    }
    contains(footerClasses.brand, "min-inline-size:var(--hraness-site-footer-control-block-size)");
    contains(footerClasses.brand, "min-block-size:var(--hraness-site-footer-control-block-size)");
    contains(footerClassName(false), "font-size:.875rem");
  });

  test("shares a static holographic border and responsive native disclosure", () => {
    contains(footerClasses.disclosureTrigger, "conic-gradient(");
    contains(footerClasses.disclosureTrigger, "var(--footer-foil-x,50%)");
    contains(disclosureClassNames("inline").root, "@supports selector(::details-content)");
    contains(disclosureClassNames("inline").trigger, "@supports selector(::details-content)");
    contains(disclosureClassNames("inline").root, "content-visibility:visible");
    contains(disclosureClassNames("inline").trigger, "display:none");
    contains(disclosureClassNames("inline").panel, "padding-block:0");
    contains(disclosureClassNames("inline").panel, "padding-inline:0");
    expect(cssFor(footerClasses.disclosureTrigger)).not.toContain("animation-name");
  });

  test("reserves matching visual padding plus the device safe area in both layouts", () => {
    for (const signup of [false, true]) {
      contains(footerInnerClassName(signup), "padding-block-start:var(--hraness-site-footer-padding-block)");
      contains(footerInnerClassName(signup), "padding-block-end:calc(var(--hraness-site-footer-padding-block) + env(safe-area-inset-bottom, 0px))");
      contains(footerClassName(signup), "--hraness-site-footer-bar-block-size:calc(var(--hraness-site-footer-content-block-size) + var(--hraness-site-footer-padding-block) + var(--hraness-site-footer-padding-block) + env(safe-area-inset-bottom, 0px) + 1px)");
    }
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
    contains(footerClasses.mailingSubmit, "border-color:ButtonText");
    contains(footerClasses.mailingSubmit, "background-image:none");
    contains(footerInnerClassName(false), "background-color:Canvas");
  });

  test("keeps status overlays outside the reserved mailing row", () => {
    contains(mailingStatusClassName("idle"), "position:absolute");
    contains(mailingStatusClassName("idle"), "opacity:0");
    contains(mailingStatusClassName("idle"), "visibility:hidden");
    for (const state of ["pending", "error"]) {
      contains(mailingStatusClassName(state), "opacity:1");
      contains(mailingStatusClassName(state), "visibility:visible");
      expect(cssFor(mailingStatusClassName(state))).not.toContain("visibility:hidden");
    }
    contains(mailingStatusClassName("error"), "color:var(--hraness-site-footer-foreground)");
    contains(mailingStatusClassName("pending"), "color:var(--hraness-site-footer-muted)");
    contains(mailingStatusClassName("idle"), "inset-block-end:calc(100% + var(--hraness-site-footer-mailing-overlay-offset) + var(--hraness-site-footer-row-gap))");
    contains(footerClasses.honeypot, "clip-path:inset(50%)");
    contains(footerClasses.honeypot, "inline-size:1px");
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
      // CSS Fonts 4 excludes font-palette from font's subproperties. Unlike
      // font-language-override, a separately cascaded child palette must survive.
      expect(cssFor(classes)).not.toContain("font-palette:");
      contains(classes, "background-image:none");
      if (classes === footerClasses.mailingInput) contains(classes, "background-origin:padding-box");
      else contains(classes, "background-origin:padding-box,border-box,border-box");
      contains(classes, "border-image-source:none");
    }
    contains(footerClasses.mailingInput, "border-start-start-radius:.375rem");
    contains(footerClasses.mailingSubmit, "border-start-end-radius:.375rem");
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


test("runtime presentation exception only permits the foil controller's numeric inputs", () => {
  expect(() => assertSourceBoundary("src/foil.ts", 'target.style.setProperty("--footer-foil-x", "50%");')).not.toThrow();
  for (const path of ["src/foil.ts", "src/react.tsx"]) {
    expect(() => assertSourceBoundary(path, 'target.style.setProperty("color", "red");')).toThrow();
  }
  expect(() => assertSourceBoundary("src/react.tsx", 'target.style.setProperty("--footer-foil-x", "50%");')).toThrow();
});
