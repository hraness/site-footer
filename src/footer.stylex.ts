import * as stylex from "@stylexjs/stylex";
import type { FooterVariant } from "./experiment.js";

export const disclosureMarker = stylex.defineMarker();
export const rootMarker = stylex.defineMarker();
// The shared Hraness foil contract. Marketing roots may define the
// --hraness-foil-* spectrum; the private --_hraness-foil-* stops resolve those
// overrides or the same scheme-conditioned defaults. The ring borrows the
// chrome bands and faint spectral reflection of the marketing header
// wordmark, lit by the surface recipe's two white pointer light fields.
const holographicSurface = "var(--hraness-site-footer-holo-surface, var(--hraness-foil-surface, var(--hraness-site-footer-background)))";
const metal = (amount: number) => `color-mix(in oklch, var(--hraness-site-footer-foreground, CanvasText) ${amount}%, var(--hraness-site-footer-background, Canvas))`;
const reflection = (index: number) => `color-mix(in oklch, var(--_hraness-foil-${index}) var(--hraness-foil-reflection, 14%), transparent)`;
const holographicBackgroundImage = [
  `linear-gradient(${holographicSurface}, ${holographicSurface})`,
  "radial-gradient(ellipse 28% 100% at var(--hraness-foil-x, 50%) var(--hraness-foil-y, 50%), color-mix(in srgb, white calc(60% + var(--hraness-foil-glow, 0) * 24%), transparent) 0%, transparent 72%)",
  "radial-gradient(ellipse 80% 180% at calc(100% - var(--hraness-foil-x, 50%)) calc(100% - var(--hraness-foil-y, 50%)), color-mix(in srgb, white 28%, transparent) 0%, transparent 78%)",
  `linear-gradient(115deg, ${[1, 2, 3, 4, 5, 6].map(reflection).join(", ")})`,
  `linear-gradient(115deg, ${metal(90)} 0%, ${metal(100)} 24%, ${metal(86)} 39%, ${metal(100)} 56%, ${metal(84)} 82%, ${metal(100)} 100%)`,
].join(", ");
const holographicBackgroundClip = "padding-box, border-box, border-box, border-box, border-box";
const holographicHalo = "0 1px 4px color-mix(in srgb, var(--hraness-site-footer-foreground, CanvasText) 12%, transparent)";
const holographicStops = {
  "--_hraness-foil-1": { default: "var(--hraness-foil-1, oklch(0.89 0.065 337))", "@media (prefers-color-scheme: dark)": "var(--hraness-foil-1, oklch(0.56 0.16 340))" },
  "--_hraness-foil-2": { default: "var(--hraness-foil-2, oklch(0.875 0.05 277))", "@media (prefers-color-scheme: dark)": "var(--hraness-foil-2, oklch(0.52 0.15 285))" },
  "--_hraness-foil-3": { default: "var(--hraness-foil-3, oklch(0.92 0.05 170))", "@media (prefers-color-scheme: dark)": "var(--hraness-foil-3, oklch(0.66 0.14 175))" },
  "--_hraness-foil-4": { default: "var(--hraness-foil-4, oklch(0.95 0.045 96))", "@media (prefers-color-scheme: dark)": "var(--hraness-foil-4, oklch(0.72 0.13 100))" },
  "--_hraness-foil-5": { default: "var(--hraness-foil-5, oklch(0.9 0.05 55))", "@media (prefers-color-scheme: dark)": "var(--hraness-foil-5, oklch(0.55 0.15 45))" },
  "--_hraness-foil-6": { default: "var(--hraness-foil-6, oklch(0.875 0.06 305))", "@media (prefers-color-scheme: dark)": "var(--hraness-foil-6, oklch(0.62 0.16 305))" },
};

// Same direction, spread, and timing as Hraness.com's token support control.
const textShimmer = stylex.keyframes({
  from: { backgroundPosition: "100% center" },
  to: { backgroundPosition: "0 center" },
});

// Owned slots share these recipes in both renderers. Product overrides remain
// ordinary custom properties on the stable footer hook.
const styles = stylex.create({
  root: {
    "--hraness-site-footer-foreground": "var(--plain-foreground, var(--foreground, currentColor))",
    "--hraness-site-footer-muted": "var(--plain-muted, var(--muted, color-mix(in srgb, currentColor 68%, transparent)))",
    "--hraness-site-footer-line": "var(--plain-line, var(--line, color-mix(in srgb, currentColor 18%, transparent)))",
    "--hraness-site-footer-focus": "var(--plain-link, var(--focus, Highlight))",
    "--hraness-site-footer-background": "var(--plain-background, var(--background, Canvas))",
    "--hraness-site-footer-action-background": "var(--plain-foreground, var(--foreground, CanvasText))",
    "--hraness-site-footer-action-foreground": "var(--plain-background, var(--background, Canvas))",
    "--hraness-site-footer-field-background": "color-mix(in srgb, var(--hraness-site-footer-foreground) 4%, var(--hraness-site-footer-background))",
    "--hraness-site-footer-social-target": { default: "1.75rem", "@media (pointer: coarse)": "44px" },
    // Four social targets plus their three 0.125rem gaps. The wide social track
    // grows to this before the flexible gap receives any space, and can still
    // shrink under pressure. The px floor keeps the fourth-icon container
    // threshold (182px on coarse pointers) satisfiable at any root font size.
    "--hraness-site-footer-socials-inline-size": "calc(4 * var(--hraness-site-footer-social-target) + max(0.375rem, 6px))",
    "--hraness-site-footer-control-block-size": {
      default: "max(var(--hraness-site-footer-social-target), 1.75rem)",
      "@media (pointer: coarse)": "max(var(--hraness-site-footer-social-target), 2.25rem)",
    },
    "--hraness-site-footer-status-block-size": "1.5rem",
    "--hraness-site-footer-form-block-size": "var(--hraness-site-footer-control-block-size)",
    "--hraness-site-footer-row-gap": "0.25rem",
    "--hraness-site-footer-mailing-overlay-clearance": "calc(var(--hraness-site-footer-control-block-size) + var(--hraness-site-footer-row-gap))",
    "--hraness-site-footer-padding-block": "clamp(0.25rem, 0.8vw, 0.375rem)",
    "--hraness-site-footer-mailing-overlay-offset": "calc(var(--hraness-site-footer-mailing-overlay-clearance) + var(--hraness-site-footer-padding-block) + 1px)",
    "--hraness-site-footer-content-block-size": "var(--hraness-site-footer-control-block-size)",
    "--hraness-site-footer-bar-block-size": "calc(var(--hraness-site-footer-content-block-size) + var(--hraness-site-footer-padding-block) + var(--hraness-site-footer-padding-block) + env(safe-area-inset-bottom, 0px) + 1px)",
    "inline-size": "100%",
    color: "var(--hraness-site-footer-foreground)",
    fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
    fontSize: "0.875rem",
  },
  signup: {
    "--hraness-site-footer-content-block-size": "max(var(--hraness-site-footer-social-target), var(--hraness-site-footer-form-block-size))",
    "--hraness-site-footer-mailing-overlay-clearance": "0rem",
  },
  stickyFootprint: { "min-block-size": "var(--hraness-site-footer-bar-block-size)" },
  stickyBar: { position: "fixed", "inset-inline": 0, "inset-block-end": 0, zIndex: 40 },
  green: {
    "--hraness-site-footer-action-background": "light-dark(#166534, #86efac)",
    "--hraness-site-footer-action-foreground": "light-dark(#ffffff, #052e16)",
  },
  orange: {
    "--hraness-site-footer-action-background": "light-dark(#9a3412, #fdba74)",
    "--hraness-site-footer-action-foreground": "light-dark(#ffffff, #431407)",
  },
  blue: {
    "--hraness-site-footer-action-background": "light-dark(#1e40af, #93c5fd)",
    "--hraness-site-footer-action-foreground": "light-dark(#ffffff, #172554)",
  },
  disclosure: { position: "static", gridArea: "mailing", "min-inline-size": 0, "max-inline-size": "22rem" },
  dialog: {
    position: { default: "absolute", ":modal": "fixed" },
    "inset-block-start": { default: "auto", ":modal": "var(--hraness-signup-viewport-top, 0px)" },
    "inset-block-end": { default: "calc(100% + 0.5rem)", ":modal": "calc(100% - var(--hraness-signup-viewport-top, 0px) - var(--hraness-signup-viewport-height, 100dvh))" },
    "inset-inline": 0, margin: "auto",
    "inline-size": "min(28rem, calc(100vw - 2rem))",
    "max-inline-size": "calc(100vw - 2rem)",
    "max-block-size": "calc(var(--hraness-signup-viewport-height, 100dvh) - 2rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
    overflowY: "auto", overscrollBehavior: "contain", scrollbarGutter: "stable",
    "padding-block": "clamp(1.25rem, 4vw, 2rem)", "padding-inline": "clamp(1.25rem, 4vw, 2rem)",
    borderWidth: 0, borderRadius: "1rem",
    backgroundColor: { default: "var(--hraness-site-footer-background)", "::backdrop": "rgb(0 0 0 / 0.55)" },
    color: "var(--hraness-site-footer-foreground)",
    boxShadow: "0 1rem 3rem rgb(0 0 0 / 0.25)",
    fontFamily: "inherit", fontSize: "1rem", lineHeight: 1.5,
  },
  dialogHeader: { display: "flex", alignItems: "start", gap: "1rem", justifyContent: "space-between" },
  dialogTitle: { margin: 0, fontSize: "1.5rem", fontWeight: 650, lineHeight: 1.2, textWrap: "balance" },
  dialogDescription: { marginBlockStart: "0.75rem", marginBlockEnd: "1.5rem", fontSize: "1rem", lineHeight: 1.5 },
  dialogClose: {
    display: { default: "inline-flex", ":is([hidden])": "none" }, alignItems: "center", justifyContent: "center", flexShrink: 0,
    "inline-size": "44px", "block-size": "44px", marginBlockStart: "-0.5rem", marginInlineEnd: "-0.5rem",
    borderWidth: 0, borderRadius: "0.375rem", backgroundColor: { default: "transparent", ":hover": "var(--hraness-site-footer-field-background)" },
    color: "inherit", cursor: "pointer",
  },
  emailLabel: { display: "block", marginBlockEnd: "0.5rem", fontSize: "0.9375rem", fontWeight: 600 },
  disclosureTrigger: {
    cursor: "pointer", fontWeight: 600,
    listStyleType: "none", "inline-size": "fit-content", "max-inline-size": "100%",
    borderRadius: "0.375rem", "margin-inline-start": 0,
    fontSize: { default: "0.75rem", "@media (min-width: 47.5rem)": "0.8125rem" },
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    "padding-inline": "0.625rem", "padding-block": 0,
    // A block flex box avoids a summary line-box strut, while the label
    // owns truncation and a page-independent, vertically centered line height.
    display: { default: "flex", "::-webkit-details-marker": "none" },
    alignItems: "center", justifyContent: "center", lineHeight: 1.2,
    backgroundImage: { default: holographicBackgroundImage, "@media (forced-colors: active)": "none" },
    borderColor: { default: "transparent", "@media (forced-colors: active)": "ButtonText" },
    color: "var(--hraness-site-footer-foreground)",
  },
  disclosureLabel: {
    display: "block", "min-inline-size": 0, overflow: "hidden",
    whiteSpace: "nowrap", textOverflow: "ellipsis",
  },
  triggerClosed: {
    gridArea: "label",
    visibility: { default: "visible", [stylex.when.ancestor("[open]", disclosureMarker)]: "hidden" },
  },
  triggerOpen: {
    gridArea: "label", fontWeight: 500,
    visibility: { default: "hidden", [stylex.when.ancestor("[open]", disclosureMarker)]: "visible" },
  },
  disclosurePanel: {
    position: "absolute", "inset-block-end": { default: "calc(100% + 0.375rem)", "@media (min-width: 47.5rem)": "calc(100% + var(--hraness-site-footer-padding-block) + 0.375rem)" },
    "inset-inline-start": { default: "1rem", "@media (min-width: 47.5rem)": 0 },
    "inline-size": "min(20rem, calc(100vw - 2rem))", "max-inline-size": "calc(100vw - 2rem)",
    "padding-block": "0.5rem", "padding-inline": "0.5rem", borderRadius: "0.5rem", zIndex: 3,
    backgroundColor: "var(--hraness-site-footer-background)",
  },
  holographic: {
    ...holographicStops,
    "--hraness-foil-glow": { default: "0", "@media (hover: hover)": { ":hover:not(:disabled)": "1" } },
    borderWidth: "2px",
    borderColor: { default: "transparent", "@media (forced-colors: active)": "ButtonText" },
    backgroundColor: holographicSurface,
    color: "var(--hraness-site-footer-foreground)",
    backgroundImage: {
      default: holographicBackgroundImage,
      "@media (forced-colors: active)": "none",
    },
    backgroundOrigin: "border-box",
    backgroundClip: holographicBackgroundClip,
    boxShadow: { default: holographicHalo, "@media (forced-colors: active)": "none" },
  },
  compactConfirmation: { fontSize: "0.75rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  shimmer: {
    "--hraness-site-footer-shimmer-spread": "calc(3ch + 40px)",
    animationName: { default: null, "@media (prefers-reduced-motion: no-preference)": textShimmer, "@media (forced-colors: active)": "none" },
    animationDuration: "2s", animationTimingFunction: "linear", animationIterationCount: "infinite",
    backgroundImage: { default: null, "@media (prefers-reduced-motion: no-preference)": "linear-gradient(110deg, currentColor calc(50% - var(--hraness-site-footer-shimmer-spread)), color-mix(in srgb, currentColor 20%, transparent) 50%, currentColor calc(50% + var(--hraness-site-footer-shimmer-spread)))", "@media (forced-colors: active)": "none" },
    backgroundPosition: "100% center", backgroundRepeat: "no-repeat",
    backgroundSize: "calc(200% + var(--hraness-site-footer-shimmer-spread) * 2) 100%",
    backgroundClip: "text",
    WebkitTextFillColor: { default: "currentColor", "@media (prefers-reduced-motion: no-preference)": "transparent", "@media (forced-colors: active)": "currentColor" },
  },
  box: { boxSizing: "border-box" },
  backgroundReset: {
    backgroundImage: "none", backgroundPosition: "0% 0%", backgroundSize: "auto",
    backgroundRepeat: "repeat", backgroundOrigin: "padding-box",
    backgroundClip: "border-box", backgroundAttachment: "scroll",
  },
  border: {
    borderWidth: "1px", borderStyle: "solid",
    borderColor: { default: "var(--hraness-site-footer-line)", "@media (forced-colors: active)": "ButtonText" },
    borderImageSource: "none", borderImageSlice: "100%", borderImageWidth: "1",
    borderImageOutset: "0", borderImageRepeat: "stretch",
  },
  focus: {
    outlineWidth: { default: null, ":focus-visible": "2px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: {
      default: null,
      ":focus-visible": { default: "var(--hraness-site-footer-focus)", "@media (forced-colors: active)": "Highlight" },
    },
    outlineOffset: { default: null, ":focus-visible": "3px" },
  },
  // Bordered controls draw the ring inside their border box so joined edges
  // (the mailing field and submit pair) never collide with a neighbor's edge.
  focusInset: {
    outlineWidth: { default: null, ":focus-visible": "2px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: {
      default: null,
      ":focus-visible": { default: "var(--hraness-site-footer-focus)", "@media (forced-colors: active)": "Highlight" },
    },
    outlineOffset: { default: null, ":focus-visible": "-3px" },
  },
  motion: {
    transitionProperty: { default: null, "@media (prefers-reduced-motion: no-preference)": "color, background-color, opacity" },
    transitionDuration: { default: null, "@media (prefers-reduced-motion: no-preference)": "120ms" },
    transitionTimingFunction: { default: null, "@media (prefers-reduced-motion: no-preference)": "ease" },
    transitionDelay: { default: null, "@media (prefers-reduced-motion: no-preference)": "0s" },
  },
  inner: {
    containerName: "hraness-footer", containerType: "inline-size",
    position: "relative", display: "grid",
    gridTemplateAreas: { default: '"brand links"', "@media (min-width: 47.5rem)": '"brand . consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, 1fr)", "@media (min-width: 47.5rem)": "auto minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
    gridTemplateRows: "var(--hraness-site-footer-control-block-size)",
    "inline-size": "100%", "block-size": "auto", "min-block-size": "var(--hraness-site-footer-bar-block-size)",
    "max-inline-size": "none", "min-inline-size": 0, alignContent: "center", alignItems: "center",
    columnGap: "clamp(0.5rem, 2vw, 1rem)", rowGap: "var(--hraness-site-footer-row-gap)",
    "border-block-start-width": "1px", "border-block-start-style": "solid",
    "border-block-start-color": { default: "transparent", "@media (forced-colors: active)": "ButtonText" },
    backgroundColor: { default: "var(--hraness-site-footer-background)", "@media (forced-colors: active)": "Canvas" },
    "padding-block-start": "var(--hraness-site-footer-padding-block)",
    "padding-block-end": "calc(var(--hraness-site-footer-padding-block) + env(safe-area-inset-bottom, 0px))",
    "padding-inline-start": "max(clamp(1rem, 4vw, 2rem), env(safe-area-inset-left))",
    "padding-inline-end": "max(clamp(1rem, 4vw, 2rem), env(safe-area-inset-right))",
  },
  innerSignup: {
    gridTemplateAreas: { default: '"brand mailing links"', "@media (min-width: 47.5rem)": '"brand mailing . consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, max-content) minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto minmax(0, max-content) minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
    gridTemplateRows: "var(--hraness-site-footer-content-block-size)",
  },
  innerAccount: {
    gridTemplateAreas: { default: '"brand mailing links"', "@media (min-width: 47.5rem)": '"brand mailing . consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, max-content) minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto minmax(0, max-content) minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
  },
  // Removing a brand must remove its track and gutter, including after a
  // React support-profile update recomputes the row's presentation.
  innerNoBrand: {
    gridTemplateAreas: { default: '"links"', "@media (min-width: 47.5rem)": '". consent links"' },
    gridTemplateColumns: { default: "minmax(0, 1fr)", "@media (min-width: 47.5rem)": "minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
  },
  innerMailingNoBrand: {
    gridTemplateAreas: { default: '"mailing links"', "@media (min-width: 47.5rem)": '"mailing . consent links"' },
    gridTemplateColumns: { default: "minmax(0, max-content) minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "minmax(0, max-content) minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
  },
  innerSupportNoBrand: {
    gridTemplateAreas: { default: '"support links"', "@media (min-width: 47.5rem)": '"support . consent links"' },
    gridTemplateColumns: { default: "auto minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
  },
  innerMailingSupportNoBrand: {
    gridTemplateAreas: { default: '"mailing support links"', "@media (min-width: 47.5rem)": '"mailing support . consent links"' },
    gridTemplateColumns: { default: "minmax(0, max-content) auto minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "minmax(0, max-content) auto minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
  },
  account: {
    gridArea: "mailing", display: "inline-flex", alignItems: "center", justifyContent: "center",
    "min-inline-size": 0, "max-inline-size": "12rem", "padding-inline": "0.625rem",
    borderRadius: "0.375rem", color: "var(--hraness-site-footer-muted)",
    fontSize: "0.8125rem", fontWeight: 500, lineHeight: 1, textDecoration: "none",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  innerSupport: {
    gridTemplateAreas: { default: '"brand support links"', "@media (min-width: 47.5rem)": '"brand support . consent links"' },
    gridTemplateColumns: { default: "auto auto minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto auto minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
  },
  innerSignupSupport: {
    gridTemplateAreas: { default: '"brand mailing support links"', "@media (min-width: 47.5rem)": '"brand mailing support . consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, max-content) auto minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto minmax(0, max-content) auto minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
  },
  innerAccountSupport: {
    gridTemplateAreas: { default: '"brand mailing support links"', "@media (min-width: 47.5rem)": '"brand mailing support . consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, max-content) auto minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto minmax(0, max-content) auto minmax(0, 1fr) auto minmax(var(--hraness-site-footer-social-target), var(--hraness-site-footer-socials-inline-size))" },
  },
  // The optional Accounts support destination is an icon-only link that shares
  // the social targets' muted treatment, size, and hover behavior.
  support: {
    gridArea: "support", display: "inline-flex", alignItems: "center", justifyContent: "center",
    "inline-size": "var(--hraness-site-footer-social-target)",
    "block-size": "var(--hraness-site-footer-social-target)",
    "min-inline-size": 0, "min-block-size": 0, borderRadius: "999px",
    color: { default: "var(--hraness-site-footer-muted)", "@media (hover: hover)": { ":hover": "var(--hraness-site-footer-foreground)" } },
    backgroundColor: { default: null, "@media (hover: hover)": { ":hover": "color-mix(in srgb, currentColor 9%, transparent)" } },
    borderColor: { default: null, "@media (forced-colors: active)": "ButtonText" },
    textDecoration: "none",
  },
  flexCenter: { display: "flex", alignItems: "center" },
  fixedFlex: { flexGrow: 0, flexShrink: 0, flexBasis: "auto" },
  brand: {
    gridArea: "brand", alignSelf: "center", justifyContent: "center",
    "min-inline-size": "var(--hraness-site-footer-control-block-size)",
    "min-block-size": "var(--hraness-site-footer-control-block-size)", borderRadius: "0.375rem",
    columnGap: "0.375rem",
    color: { default: "inherit", "@media (hover: hover)": { ":hover": "var(--hraness-site-footer-foreground)" } },
    fontWeight: 650, letterSpacing: "-0.018em", lineHeight: 1, textDecoration: "none",
  },
  brandName: {
    color: "var(--hraness-site-footer-muted)", fontSize: "0.8125rem", fontWeight: 500,
    letterSpacing: "normal", whiteSpace: "nowrap",
  },
  mark: { "inline-size": "1.375rem", "block-size": "1.375rem" },
  links: {
    gridArea: "links", containerName: "hraness-socials", containerType: "inline-size",
    "inline-size": "100%", "min-inline-size": 0, justifyContent: "flex-end", "margin-inline-start": "auto",
  },
  socials: {
    display: "flex", "min-inline-size": 0, justifyContent: "flex-end", gap: "0.125rem",
    margin: 0, padding: 0, listStyleType: "none", listStylePosition: "outside", listStyleImage: "none",
  },
  socialItem: {
    "inline-size": "var(--hraness-site-footer-social-target)", "block-size": "var(--hraness-site-footer-social-target)",
    flexGrow: 0, flexShrink: 0, flexBasis: "var(--hraness-site-footer-social-target)", "min-inline-size": 0, "min-block-size": 0,
  },
  socialAlways: { display: "block" },
  socialSecond: { display: { default: "none", "@media (pointer: fine), (pointer: none)": { "@container hraness-socials (min-width: 3.625rem)": "block" }, "@media (pointer: coarse)": { "@container hraness-socials (min-width: 90px)": "block" } } },
  socialThird: { display: { default: "none", "@media (pointer: fine), (pointer: none)": { "@container hraness-socials (min-width: 5.5rem)": "block" }, "@media (pointer: coarse)": { "@container hraness-socials (min-width: 136px)": "block" } } },
  socialFourth: { display: { default: "none", "@media (pointer: fine), (pointer: none)": { "@container hraness-socials (min-width: 7.375rem)": "block" }, "@media (pointer: coarse)": { "@container hraness-socials (min-width: 182px)": "block" } } },
  socialLink: {
    "inline-size": "100%", "block-size": "100%", justifyContent: "center", borderRadius: "999px",
    color: { default: "var(--hraness-site-footer-muted)", "@media (hover: hover)": { ":hover": "var(--hraness-site-footer-foreground)" } },
    backgroundColor: { default: null, "@media (hover: hover)": { ":hover": "color-mix(in srgb, currentColor 9%, transparent)" } },
    backgroundImage: { default: null, "@media (hover: hover)": { ":hover": "none" } },
    backgroundPosition: { default: null, "@media (hover: hover)": { ":hover": "0% 0%" } },
    backgroundSize: { default: null, "@media (hover: hover)": { ":hover": "auto" } },
    backgroundRepeat: { default: null, "@media (hover: hover)": { ":hover": "repeat" } },
    backgroundOrigin: { default: null, "@media (hover: hover)": { ":hover": "padding-box" } },
    backgroundClip: { default: null, "@media (hover: hover)": { ":hover": "border-box" } },
    backgroundAttachment: { default: null, "@media (hover: hover)": { ":hover": "scroll" } },
    borderColor: { default: null, "@media (forced-colors: active)": "ButtonText" }, textDecoration: "none",
  },
  socialIcon: { "inline-size": "1rem", "block-size": "1rem" },
  consent: {
    // The advisory consent note floats above compact bars without creating a row.
    position: { default: "absolute", "@media (min-width: 47.5rem)": "static" },
    "inset-block-end": { default: "calc(100% + 0.5rem)", "@media (min-width: 47.5rem)": "auto" },
    "inset-inline-end": "1rem", backgroundColor: "var(--hraness-site-footer-background)",
    gridColumnStart: { default: 1, "@media (min-width: 47.5rem)": "consent" },
    gridColumnEnd: { default: -1, "@media (min-width: 47.5rem)": "consent" },
    gridRowStart: { default: null, "@media (min-width: 47.5rem)": "consent" },
    gridRowEnd: { default: null, "@media (min-width: 47.5rem)": "consent" },
    alignSelf: "center", justifySelf: "end", "min-inline-size": 0,
    color: "var(--hraness-site-footer-muted)", fontSize: "0.8125rem", whiteSpace: "nowrap",
  },
  consentAccept: {
    padding: 0, borderWidth: 0, backgroundColor: "transparent", cursor: "pointer",
    color: "var(--hraness-site-footer-foreground)", fontWeight: 550,
    textDecoration: { default: "none", "@media (hover: hover)": { ":hover": "underline" } },
  },
  consentSeparator: { "margin-inline": "0.35rem" },
  consentMore: { display: "inline", position: "relative" },
  consentLearn: {
    cursor: "pointer", display: { default: "inline", "::-webkit-details-marker": "none" },
    listStyleType: "none", marginInlineStart: 0,
    textDecoration: { default: "none", "@media (hover: hover)": { ":hover": "underline" } },
  },
  consentPanel: {
    position: "absolute", zIndex: 2,
    "inset-block-end": "calc(100% + 0.75rem)", "inset-inline-end": 0,
    "inline-size": "min(18rem, calc(100vw - 2rem))", "max-inline-size": "calc(100vw - 2rem)",
    "padding-block": "0.625rem", "padding-inline": "0.75rem", borderRadius: "0.5rem",
    backgroundColor: { default: "var(--hraness-site-footer-background)", "@media (forced-colors: active)": "Canvas" },
    color: "var(--hraness-site-footer-muted)", fontSize: "0.8125rem", lineHeight: 1.45, whiteSpace: "normal",
  },
  consentLink: { color: "var(--hraness-site-footer-foreground)" },
  mailingGeometry: {
    gridArea: "mailing", "inline-size": "min(100%, 18rem)", "min-inline-size": 0,
    "block-size": "var(--hraness-site-footer-form-block-size)", margin: 0,
  },
  mailing: { position: "relative", display: { default: "block", ":is([hidden])": "none" }, margin: 0, "inline-size": "100%" },
  mailingControls: { display: "grid", gap: "1rem", "min-inline-size": 0 },
  mailingLabel: { display: "block", "min-inline-size": 0, flexGrow: 1, flexShrink: 1, flexBasis: "auto" },
  control: {
    "block-size": "var(--hraness-site-footer-control-block-size)",
    // Expand font: inherit without font-palette, which CSS Fonts 4 cascades
    // independently. font-language-override remains a reset-only subproperty.
    fontFamily: "inherit", fontSize: "inherit", fontStyle: "inherit", fontVariant: "inherit",
    fontWeight: "inherit", fontStretch: "inherit", lineHeight: "inherit", fontSizeAdjust: "inherit",
    fontKerning: "inherit", fontFeatureSettings: "inherit", fontLanguageOverride: "inherit",
    fontOpticalSizing: "inherit", fontVariationSettings: "inherit",
  },
  mailingInput: {
    "inline-size": "100%", "min-inline-size": 0, "min-block-size": "48px", fontSize: "max(1rem, 16px)",
    borderRadius: "0.5rem", backgroundColor: "var(--hraness-site-footer-field-background)",
    color: { default: "var(--hraness-site-footer-foreground)", "::placeholder": "var(--hraness-site-footer-muted)" },
    caretColor: "var(--hraness-site-footer-foreground)",
    opacity: { default: null, "::placeholder": 1 }, "padding-inline": "0.875rem",
  },
  mailingSubmit: {
    alignItems: "center", display: "inline-flex", justifyContent: "center", lineHeight: 1.2,
    borderRadius: "0.5rem", "min-block-size": "48px", "inline-size": "100%",
    backgroundColor: { default: "var(--hraness-site-footer-action-background)", "@media (forced-colors: active)": "ButtonText" },
    color: { default: "var(--hraness-site-footer-action-foreground)", "@media (forced-colors: active)": "ButtonFace" },
    cursor: { default: "pointer", ":disabled": "wait" }, opacity: { default: null, ":disabled": 0.62 },
    fontWeight: 650, fontSize: "1rem", "padding-inline": "0.875rem", textAlign: "center",
  },
  mailingStatus: {
    marginBlockStart: "1rem", marginBlockEnd: 0, "min-inline-size": 0, padding: 0,
    color: "var(--hraness-site-footer-foreground)", fontSize: "1rem", lineHeight: 1.5,
    display: "none", whiteSpace: "normal", overflowWrap: "anywhere",
  },
  statusVisible: { display: "block" },
  statusError: { color: "var(--hraness-site-footer-foreground)" },
  mailingConfirmation: {
    borderRadius: "0.375rem", backgroundColor: "var(--hraness-site-footer-field-background)",
    color: "var(--hraness-site-footer-foreground)", fontWeight: 550, "padding-inline": "0.75rem",
  },
  visuallyHidden: {
    position: "absolute", overflow: "hidden", "inline-size": "1px", "block-size": "1px", margin: "-1px", padding: 0,
    borderWidth: 0, borderStyle: "none", borderColor: "currentColor",
    borderImageSource: "none", borderImageSlice: "100%", borderImageWidth: "1", borderImageOutset: "0", borderImageRepeat: "stretch",
    clip: "rect(0 0 0 0)", clipPath: "inset(50%)", whiteSpace: "nowrap",
  },
});

function className(hook: string, ...recipes: Array<(typeof styles)[keyof typeof styles] | false>): string {
  return `${hook} ${stylex.props(...recipes).className ?? ""}`.trim();
}

export const footerClasses = {
  account: className("hraness-site-footer__account", styles.box, styles.backgroundReset, styles.border, styles.control, styles.account, styles.focusInset),
  support: className("hraness-site-footer__support", styles.box, styles.support, styles.focus, styles.motion),
  supportIcon: className("hraness-site-footer__support-icon", styles.socialIcon),
  disclosure: `${className("hraness-site-footer__disclosure", styles.disclosure)} ${stylex.props(disclosureMarker).className}`,
  disclosureTrigger: className("hraness-site-footer__disclosure-trigger", styles.box, styles.border, styles.control, styles.holographic, styles.disclosureTrigger, styles.focusInset, styles.motion),
  disclosureLabel: className("hraness-site-footer__disclosure-label", styles.disclosureLabel),
  triggerClosed: className("hraness-site-footer__disclosure-closed-label", styles.triggerClosed),
  triggerOpen: className("hraness-site-footer__disclosure-open-label", styles.triggerOpen),
  disclosurePanel: className("hraness-site-footer__disclosure-panel", styles.box, styles.border, styles.disclosurePanel),
  dialog: className("hraness-site-footer__dialog", styles.box, styles.dialog),
  dialogHeader: className("hraness-site-footer__dialog-header", styles.dialogHeader),
  dialogTitle: className("hraness-site-footer__dialog-title", styles.dialogTitle),
  dialogDescription: className("hraness-site-footer__dialog-description", styles.dialogDescription),
  dialogClose: className("hraness-site-footer__dialog-close", styles.box, styles.dialogClose, styles.focusInset),
  emailLabel: className("hraness-site-footer__email-label", styles.emailLabel),
  shimmer: className("hraness-site-footer__shimmer", styles.shimmer),
  brand: className("hraness-site-footer__brand", styles.flexCenter, styles.fixedFlex, styles.brand, styles.focus, styles.motion),
  brandName: className("hraness-site-footer__brand-name", styles.brandName),
  mark: className("hraness-site-footer__mark", styles.fixedFlex, styles.mark),
  links: className("hraness-site-footer__links", styles.flexCenter, styles.links),
  socials: className("hraness-site-footer__socials", styles.socials),
  socialLink: className("hraness-site-footer__social-link", styles.flexCenter, styles.fixedFlex, styles.socialLink, styles.focus, styles.motion),
  socialIcon: className("hraness-site-footer__social-icon", styles.socialIcon),
  consent: className("hraness-site-footer__consent", styles.box, styles.consent),
  consentAccept: className("hraness-site-footer__consent-accept", styles.box, styles.backgroundReset, styles.border, styles.control, styles.consentAccept, styles.focus, styles.motion),
  consentSeparator: className("hraness-site-footer__consent-separator", styles.consentSeparator),
  consentMore: className("hraness-site-footer__consent-more", styles.consentMore),
  consentLearn: className("hraness-site-footer__consent-learn", styles.consentLearn, styles.focus, styles.motion),
  consentPanel: className("hraness-site-footer__consent-panel", styles.box, styles.border, styles.consentPanel),
  consentLink: className("hraness-site-footer__consent-link", styles.consentLink, styles.focus, styles.motion),
  mailing: className("hraness-site-footer__mailing", styles.box, styles.mailing),
  honeypot: className("hraness-site-footer__honeypot", styles.visuallyHidden),
  mailingControls: className("hraness-site-footer__mailing-controls", styles.box, styles.mailingControls),
  mailingLabel: className("hraness-site-footer__mailing-label", styles.box, styles.mailingLabel),
  mailingInput: className("hraness-site-footer__mailing-input", styles.box, styles.backgroundReset, styles.border, styles.control, styles.mailingInput, styles.focusInset),
  mailingSubmit: className("hraness-site-footer__mailing-submit", styles.box, styles.backgroundReset, styles.border, styles.control, styles.fixedFlex, styles.mailingSubmit, styles.holographic, styles.focusInset, styles.motion),
  mailingConfirmation: className("hraness-site-footer__mailing-confirmation", styles.box, styles.backgroundReset, styles.border, styles.mailingGeometry, styles.flexCenter, styles.mailingConfirmation, styles.compactConfirmation, styles.focusInset),
  visuallyHidden: className("hraness-site-footer__visually-hidden", styles.visuallyHidden),
};

export function footerClassName(signup: boolean, sticky = true): string {
  return `${className("hraness-site-footer", styles.root, signup && styles.signup, sticky && styles.stickyFootprint)} ${stylex.props(rootMarker).className}`;
}

export function footerInnerClassName(signup: boolean, sticky = true, color: FooterVariant["color"] = "green", account = false, support = false, showBrand = true): string {
  const colorStyle = color === "orange" ? styles.orange : color === "blue" ? styles.blue : styles.green;
  return className("hraness-site-footer__inner", styles.box, styles.backgroundReset, styles.inner, signup && styles.innerSignup, account && styles.innerAccount, support && styles.innerSupport, support && signup && styles.innerSignupSupport, support && account && styles.innerAccountSupport, !showBrand && styles.innerNoBrand, !showBrand && (signup || account) && styles.innerMailingNoBrand, !showBrand && support && styles.innerSupportNoBrand, !showBrand && support && (signup || account) && styles.innerMailingSupportNoBrand, sticky && styles.stickyBar, signup && colorStyle);
}

export function socialItemClassName(index = 0): string {
  return className("hraness-site-footer__social-item", styles.socialItem,
    index === 1 ? styles.socialSecond : index === 2 ? styles.socialThird : index === 3 ? styles.socialFourth : styles.socialAlways);
}

export function mailingStatusClassName(state: string): string {
  return className("hraness-site-footer__mailing-status", styles.box, styles.mailingStatus, styles.focusInset,
    state !== "idle" && styles.statusVisible,
    state === "error" && styles.statusError);
}

/** Historical layout arguments no longer change the stable signup surface. */
export function disclosureClassNames(_layout: FooterVariant["layout"]): { root: string; trigger: string; panel: string } {
  return { root: footerClasses.disclosure, trigger: footerClasses.disclosureTrigger, panel: footerClasses.disclosurePanel };
}
