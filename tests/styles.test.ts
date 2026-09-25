import { describe, expect, test } from "bun:test";
import * as stylex from "@stylexjs/stylex";
import { createStylexTransformCollector, readStylexPackageManifest } from "@hraness/ui/stylex-build";
import { resolve } from "node:path";
import {
  disclosureClassNames, disclosureMarker, footerClasses, footerClassName, footerInnerClassName, mailingStatusClassName, rootMarker, socialItemClassName,
} from "../src/footer.stylex.js";
import { assertPresentationBoundary, assertSourceBoundary } from "../scripts/check-stylex-artifacts.js";

const repository = resolve(import.meta.dir, "..");
const manifest = await readStylexPackageManifest(resolve(repository, "dist/stylex-manifest.json"), repository);
const rules = new Map(manifest.rules.map(([key, value]) => [key, value.ltr]));
const disclosureMarkerClass = stylex.props(disclosureMarker).className;
const rootMarkerClass = stylex.props(rootMarker).className;
function cssFor(classes: string): string {
  const atomic = classes.split(/\s+/u).filter((name) => name.startsWith("x"));
  expect(atomic.length).toBeGreaterThan(0);
  return atomic.map((name) => {
    // Retained public markers may have no dependent rules in the stable surface.
    if (name === disclosureMarkerClass || name === rootMarkerClass) return "";
    expect(rules.has(name)).toBeTrue();
    return rules.get(name) ?? "";
  }).join("\n").replace(/\s+/gu, "");
}
function contains(classes: string, declaration: string): void {
  expect(cssFor(classes)).toContain(declaration.replace(/\s+/gu, ""));
}

describe("compiled footer presentation", () => {
  test("account navigation has a quiet border and content-sized one-row layout", () => {
    contains(footerClasses.account, "border-color:var(--hraness-site-footer-line)");
    contains(footerClasses.account, "color:var(--hraness-site-footer-muted)");
    contains(footerClasses.account, ":focus-visible");
    expect(cssFor(footerClasses.account)).not.toContain("conic-gradient");
    expect(cssFor(footerClasses.account)).not.toContain("animation-name");
    contains(footerInnerClassName(false, true, "green", true), 'grid-template-areas:"brand mailing links"');
    expect(cssFor(footerInnerClassName(false, true, "green", true))).not.toContain("#166534");
  });
  test("binds the fail-fast compiler and portable support dependency", async () => {
    const pkg = await Bun.file(new URL("../package.json", import.meta.url)).json();
    expect(pkg.version).toBe("0.18.0");
    expect(pkg.devDependencies["@hraness/ui"]).toBe("github:hraness/ui#v0.5.12");
    expect(pkg.peerDependencies).toEqual({ react: ">=18 <20" });
    expect(pkg.peerDependenciesMeta).toEqual({ react: { optional: true } });
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.devDependencies["@hraness/support-foundation"]).toBe("github:hraness/support-foundation#ed89e584c2c420e3e0547bbe8f32baf8e3a2ae4d");
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
    contains(footerInnerClassName(false), 'grid-template-areas:"brand . consent links"');
    contains(footerInnerClassName(true), 'grid-template-areas:"brand mailing links"');
    contains(footerInnerClassName(true), 'grid-template-areas:"brand mailing . consent links"');
    contains(footerInnerClassName(true), "@media (min-width:47.5rem)");
    contains(signup, "--hraness-site-footer-mailing-overlay-clearance:0rem");
    contains(signup, "--hraness-site-footer-content-block-size:max(var(--hraness-site-footer-social-target),var(--hraness-site-footer-form-block-size))");
    contains(footerInnerClassName(true), "min-block-size:var(--hraness-site-footer-bar-block-size)");
    for (const inset of ["left", "right"]) contains(footerInnerClassName(true), `env(safe-area-inset-${inset})`);
    contains(footerInnerClassName(true), "env(safe-area-inset-bottom, 0px)");
  });

  test("keeps visible compact consent inside the bar and reserves the same second row", () => {
    const root = footerClassName(false);
    contains(root, "--_hraness-site-footer-consent-block-size:0px");
    contains(root, ':has(>.hraness-site-footer__inner>[data-slot="hraness-cookie-consent"]:not([hidden]))');
    contains(root, "--_hraness-site-footer-consent-block-size:calc(var(--hraness-site-footer-control-block-size) + var(--hraness-site-footer-row-gap))");
    contains(root, "@media (min-width:47.5rem)");
    contains(footerClasses.consent, "position:static");
    contains(footerClasses.consent, ":is([hidden])");
    contains(footerClasses.consent, "display:none");
    contains(footerClasses.consent, "grid-row-start:2");
    contains(footerClasses.consent, "grid-row-end:3");
    contains(footerClasses.consent, "block-size:var(--hraness-site-footer-control-block-size)");
    contains(footerClasses.consent, "background-color:Canvas");
    expect(cssFor(footerClasses.consent)).not.toContain("position:absolute");
    expect(cssFor(footerClasses.consent)).not.toContain("inset-block-end:");
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

  test("keeps the organization lockup and icon support control inside the single row", () => {
    // The brand lockup reads the Ra mark followed by "by Hraness" at every width.
    contains(footerClasses.brand, "grid-area:brand");
    contains(footerClasses.brand, "column-gap:.375rem");
    contains(footerClasses.brandName, "color:var(--hraness-site-footer-muted)");
    contains(footerClasses.brandName, "font-size:.8125rem");
    contains(footerClasses.brandName, "white-space:nowrap");
    // The optional support destination is a muted icon-only link sharing the
    // social target size, round hover, and forced-color treatment.
    for (const declaration of [
      "grid-area:support",
      "inline-size:var(--hraness-site-footer-social-target)",
      "block-size:var(--hraness-site-footer-social-target)",
      "border-radius:999px",
      "color:var(--hraness-site-footer-muted)",
      "text-decoration:none",
      "border-color:ButtonText",
      "@media (hover:hover)",
      "@media (forced-colors:active)",
    ]) contains(footerClasses.support, declaration);
    expect(cssFor(footerClasses.support)).toContain("color-mix(insrgb,currentColor9%,transparent)");
    contains(footerClasses.supportIcon, "inline-size:1rem");
    contains(footerClasses.supportIcon, "block-size:1rem");
    // The wide social track grows to four targets before the flexible gap
    // receives anything, yet still shrinks (hiding icons in priority order)
    // when the row is starved. The px floor keeps the coarse 182px fourth-icon
    // threshold reachable at any root font size.
    contains(footerClassName(false), "--hraness-site-footer-socials-inline-size:calc(4 * var(--hraness-site-footer-social-target) + max(.375rem, 6px))");
    const socials = "minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))";
    for (const [inner, columns] of [
      [footerInnerClassName(false), `auto minmax(0, 1fr) auto ${socials}`],
      [footerInnerClassName(true), `auto minmax(0, max-content) minmax(0, 1fr) auto ${socials}`],
      [footerInnerClassName(false, true, "green", true), `auto minmax(0, max-content) minmax(0, 1fr) auto ${socials}`],
      [footerInnerClassName(false, true, "green", false, true), `auto auto minmax(0, 1fr) auto ${socials}`],
      [footerInnerClassName(true, true, "green", false, true), `auto minmax(0, max-content) auto minmax(0, 1fr) auto ${socials}`],
      [footerInnerClassName(false, true, "green", true, true), `auto minmax(0, max-content) auto minmax(0, 1fr) auto ${socials}`],
    ] as const) contains(inner, `grid-template-columns:${columns}`);
    for (const inner of [footerInnerClassName(false), footerInnerClassName(true), footerInnerClassName(false, true, "green", true)]) {
      // Compact templates never gain a consent column or gap.
      expect(cssFor(inner)).toMatch(/grid-template-areas:"brand(?:mailing)?links"/u);
    }
    contains(footerInnerClassName(true, true, "green", false, true), 'grid-template-areas:"brand mailing support . consent links"');
    contains(footerInnerClassName(false, true, "green", false, true), 'grid-template-areas:"brand support . consent links"');
  });

  test("keeps one visible foil button and a scrollable native dialog at every width", () => {
    contains(footerClasses.disclosureTrigger, "linear-gradient(115deg");
    contains(footerClasses.disclosureTrigger, "radial-gradient(ellipse 28% 100% at var(--hraness-foil-x,50%)");
    expect(cssFor(footerClasses.disclosureTrigger)).not.toContain("conic-gradient");
    expect(disclosureClassNames("inline")).toEqual(disclosureClassNames("button"));
    expect(cssFor(footerClasses.disclosureTrigger)).not.toContain("@supportsselector(::details-content)");
    expect(cssFor(footerClasses.disclosure)).not.toContain("visibility:hidden");
    contains(footerClasses.dialog, ":modal");
    contains(footerClasses.dialog, "overflow-y:auto");
    contains(footerClasses.dialog, "var(--hraness-signup-viewport-height,100dvh)");
    contains(footerClasses.dialog, "::backdrop");
    contains(footerClasses.mailingInput, "font-size:max(1rem,16px)");
    contains(footerClasses.mailingInput, "min-block-size:48px");
    contains(footerClasses.dialogClose, "inline-size:44px");
    expect(cssFor(footerClasses.disclosureTrigger)).not.toContain("animation-name");
  });

  test("centers a truncating signup label independently of the page line height", () => {
    contains(footerClasses.disclosureTrigger, "display:flex");
    contains(footerClasses.disclosureTrigger, "align-items:center");
    contains(footerClasses.disclosureTrigger, "justify-content:center");
    contains(footerClasses.disclosureTrigger, "line-height:1.2");
    contains(footerClasses.disclosureTrigger, "padding-block:0");
    contains(footerClasses.disclosureLabel, "min-inline-size:0");
    contains(footerClasses.disclosureLabel, "text-overflow:ellipsis");
    expect(cssFor(footerClasses.disclosureTrigger)).not.toContain("grid-template-areas");
  });

  test("removes the absent brand track from every mailing and support combination", () => {
    for (const signup of [false, true]) for (const account of [false, true]) for (const support of [false, true]) {
      if (signup && account) continue;
      const css = cssFor(footerInnerClassName(signup, true, "green", account, support, false));
      expect(css).not.toContain("brand");
      const leading = [...(signup || account ? ["mailing"] : []), ...(support ? ["support"] : [])];
      expect(css).toContain(`grid-template-areas:"${[...leading, "links"].join("")}"`);
      expect(css).toContain(`grid-template-areas:"${[...leading, ".", "consent", "links"].join("")}"`);
    }
  });

  test("uses a quiet separate email field and foil submit with readable controls", () => {
    expect(cssFor(footerClasses.mailingInput)).not.toContain("linear-gradient(115deg");
    contains(footerClasses.mailingSubmit, "linear-gradient(115deg");
    contains(footerClasses.mailingSubmit, "min-block-size:48px");
    contains(footerClasses.mailingControls, "display:grid");
    contains(footerClasses.mailingControls, "gap:1rem");
    contains(footerClasses.emailLabel, "display:block");
  });

  test("reads the shared six-stop foil spectrum with the deeper dark palette", () => {
    for (const stop of ["--_hraness-foil-1", "--_hraness-foil-2", "--_hraness-foil-3", "--_hraness-foil-4", "--_hraness-foil-5", "--_hraness-foil-6"]) {
      contains(footerClasses.mailingSubmit, `var(${stop})`);
      contains(footerClasses.mailingSubmit, `var(--hraness-foil-${stop.at(-1)},`);
    }
    contains(footerClasses.mailingSubmit, "@media(prefers-color-scheme:dark)");
    contains(footerClasses.mailingSubmit, "0 1px 4px color-mix(in srgb");
    contains(footerClasses.mailingSubmit, "padding-box,border-box,border-box,border-box,border-box");
    contains(footerClasses.mailingSubmit, "--hraness-foil-surface");
  });

  test("paints the header's metallic chrome with only a faint spectral reflection", () => {
    for (const control of [footerClasses.mailingSubmit, footerClasses.disclosureTrigger]) {
      contains(control, "var(--hraness-foil-reflection,14%)");
      contains(control, "color-mix(in oklch,var(--hraness-site-footer-foreground,CanvasText) 86%,var(--hraness-site-footer-background,Canvas)) 39%");
      expect(cssFor(control)).not.toContain("linear-gradient(115deg,var(--_hraness-foil-1),");
    }
    expect(cssFor(footerClasses.mailingSubmit)).not.toContain("--hraness-foil-angle");
    expect(cssFor(footerClasses.disclosureTrigger)).not.toContain("--hraness-foil-angle");
    expect(cssFor(footerClasses.mailingSubmit)).not.toContain("--footer-foil-");
    expect(cssFor(footerClasses.mailingSubmit)).not.toContain("lightningcss");
    expect(cssFor(footerClasses.disclosureTrigger)).not.toContain("--footer-foil-");
  });

  test("never hides signup while optional attribution is pending", () => {
    expect(cssFor(footerClasses.disclosure)).not.toMatch(/arming|visibility:hidden|opacity:0/u);
    expect(cssFor(footerClassName(true)).length).toBeGreaterThan(0);
  });

  test("reserves matching visual padding plus the device safe area in both layouts", () => {
    for (const signup of [false, true]) {
      contains(footerInnerClassName(signup), "padding-block-start:var(--hraness-site-footer-padding-block)");
      contains(footerInnerClassName(signup), "padding-block-end:calc(var(--hraness-site-footer-padding-block) + env(safe-area-inset-bottom, 0px))");
      contains(footerClassName(signup), "--hraness-site-footer-bar-block-size:calc(var(--hraness-site-footer-content-block-size) + var(--_hraness-site-footer-consent-block-size) + var(--hraness-site-footer-padding-block) + var(--hraness-site-footer-padding-block) + env(safe-area-inset-bottom, 0px) + 1px)");
    }
  });

  test("preserves native focus, hover, disabled, reduced-motion, and forced-color behavior", () => {
    for (const classes of [footerClasses.brand, footerClasses.support, footerClasses.socialLink]) {
      contains(classes, ":focus-visible");
      contains(classes, "outline-width:2px");
      contains(classes, "outline-offset:3px");
      contains(classes, "outline-color:Highlight");
    }
    // Bordered controls draw the ring inside their border box so joined edges
    // never collide with a neighbor's edge.
    for (const classes of [footerClasses.account, footerClasses.disclosureTrigger,
      footerClasses.mailingInput, footerClasses.mailingSubmit,
      footerClasses.mailingConfirmation, mailingStatusClassName("idle")]) {
      contains(classes, ":focus-visible");
      contains(classes, "outline-width:2px");
      contains(classes, "outline-offset:-3px");
      contains(classes, "outline-color:Highlight");
    }
    contains(footerClasses.mailingSubmit, ":disabled");
    contains(footerClasses.mailingSubmit, "opacity:.62");
    contains(footerClasses.mailingSubmit, ":hover:not(:disabled)");
    contains(footerClasses.mailingSubmit, "--hraness-foil-glow:1");
    contains(footerClasses.mailingInput, "::placeholder");
    for (const classes of [footerClasses.brand, footerClasses.support, footerClasses.socialLink, footerClasses.mailingSubmit]) {
      contains(classes, "@media (hover:hover)");
      contains(classes, "@media (prefers-reduced-motion:no-preference)");
      contains(classes, "transition-duration:.12s");
    }
    contains(footerClasses.mailingSubmit, "border-color:ButtonText");
    contains(footerClasses.mailingSubmit, "background-image:none");
    contains(footerInnerClassName(false), "background-color:Canvas");
  });

  test("keeps request status within the modal flow and outside the hidden accepted form", () => {
    contains(mailingStatusClassName("idle"), "display:none");
    for (const state of ["pending", "error", "accepted"]) {
      contains(mailingStatusClassName(state), "display:block");
      expect(cssFor(mailingStatusClassName(state))).not.toContain("position:absolute");
    }
    contains(footerClasses.honeypot, "clip-path:inset(50%)");
    contains(footerClasses.honeypot, "inline-size:1px");
    contains(footerClasses.mailing, "inline-size:100%");
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
      contains(classes, "border-image-source:none");
    }
    contains(footerClasses.mailingInput, "border-radius:.5rem");
    contains(footerClasses.mailingSubmit, "border-radius:.5rem");
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


test("runtime presentation exceptions remain limited to foil inputs and native modal viewport custody", () => {
  expect(() => assertSourceBoundary("src/foil.ts", 'target.style.setProperty("--hraness-foil-x", "50%");')).not.toThrow();
  for (const path of ["src/foil.ts", "src/react.tsx"]) {
    expect(() => assertSourceBoundary(path, 'target.style.setProperty("color", "red");')).toThrow();
  }
  expect(() => assertSourceBoundary("src/react.tsx", 'target.style.setProperty("--hraness-foil-x", "50%");')).toThrow();
});

test("native modal runtime exception rejects arbitrary root or dialog presentation", () => {
  for (const source of [
    'dialog.style.setProperty("--hraness-signup-viewport-height", "600px");',
    'root.style.setProperty("overflow", "hidden");',
    'root.style.getPropertyPriority("overflow");',
  ]) expect(() => assertSourceBoundary("src/react.tsx", source)).not.toThrow();
  for (const source of [
    'dialog.style.setProperty("color", "red");',
    'root.style.setProperty("display", "none");',
    'target.style.setProperty("--hraness-signup-viewport-height", "600px");',
  ]) expect(() => assertSourceBoundary("src/react.tsx", source)).toThrow();
});
