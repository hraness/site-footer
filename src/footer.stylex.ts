import * as stylex from "@stylexjs/stylex";
import type { FooterVariant } from "./experiment.js";

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
    "--hraness-site-footer-social-target": { default: "40px", "@media (pointer: coarse)": "44px" },
    "--hraness-site-footer-control-block-size": {
      default: "max(var(--hraness-site-footer-social-target), 2.5rem)",
      "@media (pointer: coarse)": "max(var(--hraness-site-footer-social-target), 2.75rem)",
    },
    "--hraness-site-footer-status-block-size": "1.5rem",
    "--hraness-site-footer-form-block-size": "var(--hraness-site-footer-control-block-size)",
    "--hraness-site-footer-row-gap": "0.375rem",
    "--hraness-site-footer-mailing-overlay-clearance": "calc(var(--hraness-site-footer-control-block-size) + var(--hraness-site-footer-row-gap))",
    "--hraness-site-footer-padding-block": "clamp(0.375rem, 1vw, 0.5rem)",
    "--hraness-site-footer-mailing-overlay-offset": "calc(var(--hraness-site-footer-mailing-overlay-clearance) + var(--hraness-site-footer-padding-block) + 1px)",
    "--hraness-site-footer-content-block-size": "var(--hraness-site-footer-control-block-size)",
    "--hraness-site-footer-bar-block-size": "calc(var(--hraness-site-footer-content-block-size) + var(--hraness-site-footer-padding-block) + var(--hraness-site-footer-padding-block) + env(safe-area-inset-bottom, 0px) + 1px)",
    "inline-size": "100%",
    color: "var(--hraness-site-footer-foreground)",
    fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
    fontSize: "1rem",
  },
  signup: {
    "--hraness-site-footer-content-block-size": {
      default: "calc(var(--hraness-site-footer-control-block-size) + var(--hraness-site-footer-row-gap) + var(--hraness-site-footer-form-block-size))",
      "@media (min-width: 47.5rem)": "max(var(--hraness-site-footer-social-target), var(--hraness-site-footer-form-block-size))",
    },
    "--hraness-site-footer-mailing-overlay-clearance": {
      default: "calc(var(--hraness-site-footer-control-block-size) + var(--hraness-site-footer-row-gap))",
      "@media (min-width: 47.5rem)": "0rem",
    },
  },
  stickyFootprint: { "min-block-size": "var(--hraness-site-footer-bar-block-size)" },
  stickyBar: { position: "fixed", "inset-inline": 0, "inset-block-end": 0, zIndex: 40 },
  green: {
    "--hraness-site-footer-action-background": "light-dark(#166534, #86efac)",
    "--hraness-site-footer-action-foreground": "light-dark(#ffffff, #052e16)",
    "--hraness-site-footer-field-line": "light-dark(#166534, #86efac)",
  },
  orange: {
    "--hraness-site-footer-action-background": "light-dark(#9a3412, #fdba74)",
    "--hraness-site-footer-action-foreground": "light-dark(#ffffff, #431407)",
    "--hraness-site-footer-field-line": "light-dark(#9a3412, #fdba74)",
  },
  blue: {
    "--hraness-site-footer-action-background": "light-dark(#1e40af, #93c5fd)",
    "--hraness-site-footer-action-foreground": "light-dark(#ffffff, #172554)",
    "--hraness-site-footer-field-line": "light-dark(#1e40af, #93c5fd)",
  },
  experimentBorder: {
    borderColor: { default: "var(--hraness-site-footer-field-line, var(--hraness-site-footer-line))", "@media (forced-colors: active)": "ButtonText" },
  },
  disclosure: { position: "relative", gridArea: "mailing", "min-inline-size": 0 },
  disclosureTrigger: {
    listStyleType: "none", "inline-size": "fit-content", "max-inline-size": "100%",
    borderRadius: "0.375rem", "margin-inline-start": 0,
    display: { default: "inline-flex", "::-webkit-details-marker": "none" },
  },
  disclosurePanel: {
    position: "absolute", "inset-block-end": "calc(100% + 0.75rem)", "inset-inline-start": 0,
    "inline-size": "min(26rem, calc(100vw - 2rem))", "max-inline-size": "calc(100vw - 2rem)",
    "padding-block": "0.75rem", "padding-inline": "0.75rem", borderRadius: "0.5rem",
    backgroundColor: "var(--hraness-site-footer-background)",
  },
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
  motion: {
    transitionProperty: { default: null, "@media (prefers-reduced-motion: no-preference)": "color, background-color, opacity" },
    transitionDuration: { default: null, "@media (prefers-reduced-motion: no-preference)": "120ms" },
    transitionTimingFunction: { default: null, "@media (prefers-reduced-motion: no-preference)": "ease" },
    transitionDelay: { default: null, "@media (prefers-reduced-motion: no-preference)": "0s" },
  },
  inner: {
    containerName: "hraness-footer", containerType: "inline-size",
    position: "relative", display: "grid",
    gridTemplateAreas: '"brand links"', gridTemplateColumns: "auto minmax(0, 1fr)",
    gridTemplateRows: "var(--hraness-site-footer-control-block-size)",
    "inline-size": "100%", "block-size": "var(--hraness-site-footer-bar-block-size)",
    "max-inline-size": "none", "min-inline-size": 0, alignContent: "center", alignItems: "center",
    columnGap: "clamp(0.5rem, 2vw, 1rem)", rowGap: "var(--hraness-site-footer-row-gap)",
    "border-block-start-width": "1px", "border-block-start-style": "solid",
    "border-block-start-color": { default: "var(--hraness-site-footer-line)", "@media (forced-colors: active)": "ButtonText" },
    backgroundColor: { default: "var(--hraness-site-footer-background)", "@media (forced-colors: active)": "Canvas" },
    "padding-block-start": "var(--hraness-site-footer-padding-block)",
    "padding-block-end": "calc(var(--hraness-site-footer-padding-block) + env(safe-area-inset-bottom, 0px))",
    "padding-inline-start": "max(clamp(1rem, 4vw, 2rem), env(safe-area-inset-left))",
    "padding-inline-end": "max(clamp(1rem, 4vw, 2rem), env(safe-area-inset-right))",
  },
  innerSignup: {
    gridTemplateAreas: { default: '"brand links" "mailing mailing"', "@media (min-width: 47.5rem)": '"brand mailing links"' },
    gridTemplateColumns: { default: "auto minmax(0, 1fr)", "@media (min-width: 47.5rem)": "auto minmax(12rem, 26rem) minmax(max-content, 1fr)" },
    gridTemplateRows: { default: "var(--hraness-site-footer-control-block-size) var(--hraness-site-footer-form-block-size)", "@media (min-width: 47.5rem)": "var(--hraness-site-footer-content-block-size)" },
  },
  flexCenter: { display: "flex", alignItems: "center" },
  fixedFlex: { flexGrow: 0, flexShrink: 0, flexBasis: "auto" },
  brand: {
    gridArea: "brand", alignSelf: "center", justifyContent: "center",
    "min-inline-size": "var(--hraness-site-footer-control-block-size)",
    "min-block-size": "var(--hraness-site-footer-control-block-size)", borderRadius: "0.375rem",
    color: { default: "inherit", "@media (hover: hover)": { ":hover": "var(--hraness-site-footer-foreground)" } },
    fontWeight: 650, letterSpacing: "-0.018em", lineHeight: 1, textDecoration: "none",
  },
  mark: { "inline-size": "1.75rem", "block-size": "1.75rem" },
  links: {
    gridArea: "links",
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
  socialIcon: { "inline-size": "1.125rem", "block-size": "1.125rem" },
  mailingGeometry: {
    gridArea: "mailing", "inline-size": "min(100%, 26rem)", "min-inline-size": 0,
    "block-size": "var(--hraness-site-footer-form-block-size)", margin: 0,
  },
  mailing: { position: "relative", display: "grid", gridTemplateRows: "var(--hraness-site-footer-control-block-size)" },
  turnstile: {
    position: "absolute", zIndex: 1, "inset-inline-start": 0,
    "inset-block-end": "calc(100% + var(--hraness-site-footer-mailing-overlay-offset) + var(--hraness-site-footer-status-block-size) + var(--hraness-site-footer-row-gap) + var(--hraness-site-footer-row-gap))",
    "inline-size": "100%", "max-inline-size": "26rem", "min-inline-size": 0,
  },
  mailingControls: { display: "flex", "min-inline-size": 0 },
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
    "inline-size": "100%", "min-inline-size": 0,
    borderStartStartRadius: "0.375rem", borderStartEndRadius: 0, borderEndEndRadius: 0, borderEndStartRadius: "0.375rem",
    backgroundColor: "var(--hraness-site-footer-field-background)",
    color: { default: "var(--hraness-site-footer-foreground)", "::placeholder": "var(--hraness-site-footer-muted)" },
    opacity: { default: null, "::placeholder": 1 }, "padding-inline": "0.625rem",
  },
  mailingSubmit: {
    alignItems: "center", display: "inline-flex", justifyContent: "center", lineHeight: 1, "margin-inline-start": "-1px",
    borderStartStartRadius: 0, borderStartEndRadius: "0.375rem", borderEndEndRadius: "0.375rem", borderEndStartRadius: 0,
    backgroundColor: { default: "var(--hraness-site-footer-action-background)", "@media (forced-colors: active)": "ButtonText" },
    color: { default: "var(--hraness-site-footer-action-foreground)", "@media (forced-colors: active)": "ButtonFace" },
    cursor: { default: "pointer", ":disabled": "wait" },
    opacity: { default: null, ":disabled": 0.62, "@media (hover: hover)": { ":hover:not(:disabled)": 0.82 } },
    fontWeight: 650, "padding-inline": "clamp(0.625rem, 1.5vw, 0.875rem)", "max-inline-size": "60%", textAlign: "center",
  },
  mailingStatus: {
    position: "absolute", zIndex: 2,
    "inset-block-end": "calc(100% + var(--hraness-site-footer-mailing-overlay-offset) + var(--hraness-site-footer-row-gap))",
    "inset-inline": 0, overflow: "hidden", "min-inline-size": 0, "min-block-size": "var(--hraness-site-footer-status-block-size)",
    margin: 0, borderRadius: "0.375rem",
    backgroundColor: { default: "var(--hraness-site-footer-background)", "@media (forced-colors: active)": "Canvas" },
    color: "var(--hraness-site-footer-muted)", fontSize: "0.875rem", lineHeight: 1.25, opacity: 0,
    "padding-block": "0.35rem", "padding-inline": "0.5rem", pointerEvents: "none", visibility: "hidden", whiteSpace: "normal", overflowWrap: "anywhere",
  },
  statusVisible: { opacity: 1, visibility: "visible" },
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
  disclosure: className("hraness-site-footer__disclosure", styles.disclosure),
  disclosureTrigger: className("hraness-site-footer__disclosure-trigger", styles.box, styles.border, styles.control, styles.mailingSubmit, styles.experimentBorder, styles.disclosureTrigger, styles.focus, styles.motion),
  disclosurePanel: className("hraness-site-footer__disclosure-panel", styles.box, styles.border, styles.disclosurePanel),
  shimmer: className("hraness-site-footer__shimmer", styles.shimmer),
  brand: className("hraness-site-footer__brand", styles.flexCenter, styles.fixedFlex, styles.brand, styles.focus, styles.motion),
  mark: className("hraness-site-footer__mark", styles.fixedFlex, styles.mark),
  links: className("hraness-site-footer__links", styles.flexCenter, styles.links),
  socials: className("hraness-site-footer__socials", styles.socials),
  socialLink: className("hraness-site-footer__social-link", styles.flexCenter, styles.fixedFlex, styles.socialLink, styles.focus, styles.motion),
  socialIcon: className("hraness-site-footer__social-icon", styles.socialIcon),
  mailing: className("hraness-site-footer__mailing", styles.box, styles.mailingGeometry, styles.mailing),
  turnstile: className("hraness-site-footer__turnstile", styles.box, styles.turnstile),
  mailingControls: className("hraness-site-footer__mailing-controls", styles.box, styles.mailingControls),
  mailingLabel: className("hraness-site-footer__mailing-label", styles.box, styles.mailingLabel),
  mailingInput: className("hraness-site-footer__mailing-input", styles.box, styles.backgroundReset, styles.border, styles.experimentBorder, styles.control, styles.mailingInput, styles.focus),
  mailingSubmit: className("hraness-site-footer__mailing-submit", styles.box, styles.backgroundReset, styles.border, styles.experimentBorder, styles.control, styles.fixedFlex, styles.mailingSubmit, styles.focus, styles.motion),
  mailingConfirmation: className("hraness-site-footer__mailing-confirmation", styles.box, styles.backgroundReset, styles.border, styles.mailingGeometry, styles.flexCenter, styles.mailingConfirmation, styles.focus),
  visuallyHidden: className("hraness-site-footer__visually-hidden", styles.visuallyHidden),
};

export function footerClassName(signup: boolean, sticky = true): string {
  return className("hraness-site-footer", styles.root, signup && styles.signup, sticky && styles.stickyFootprint);
}

export function footerInnerClassName(signup: boolean, sticky = true, color: FooterVariant["color"] = "green"): string {
  const colorStyle = color === "orange" ? styles.orange : color === "blue" ? styles.blue : styles.green;
  return className("hraness-site-footer__inner", styles.box, styles.backgroundReset, styles.inner, signup && styles.innerSignup, sticky && styles.stickyBar, signup && colorStyle);
}

export function socialItemClassName(): string {
  return className("hraness-site-footer__social-item", styles.socialItem, styles.socialAlways);
}

export function mailingStatusClassName(state: string): string {
  return className("hraness-site-footer__mailing-status", styles.box, styles.backgroundReset, styles.border, styles.mailingStatus, styles.focus,
    state !== "idle" && styles.statusVisible,
    (state === "error" || state === "verification-error") && styles.statusError);
}
