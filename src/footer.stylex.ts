import * as stylex from "@stylexjs/stylex";
import type { FooterVariant } from "./experiment.js";

export const disclosureMarker = stylex.defineMarker();
const holographicBackgroundImage = "linear-gradient(var(--hraness-site-footer-background), var(--hraness-site-footer-background)), radial-gradient(circle at var(--footer-foil-x, 50%) var(--footer-foil-y, 50%), color-mix(in srgb, #ffffff calc(64% + var(--footer-foil-glow, 0) * 28%), transparent) 0%, #ffffff00 46%), conic-gradient(from var(--footer-foil-angle, 135deg), #ffd7f2, #d2dcff, #c8f3e4, #fdf2c0, #ffdcc9, #e9d9ff, #ffd7f2)";
const holographicBackgroundClip = "padding-box, border-box, border-box";

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
  disclosure: { position: { default: "static", "@media (min-width: 47.5rem)": "relative" }, gridArea: "mailing", "min-inline-size": 0, "max-inline-size": { default: "12rem", "@media (min-width: 47.5rem)": "20rem" } },
  disclosureInline: {
    // Keep one native form: on wide screens the same closed disclosure becomes
    // the inline experiment arm. Modern details hides via content-visibility.
    contentVisibility: { default: null, "@supports selector(::details-content)": { "@media (min-width: 47.5rem)": { "::details-content": "visible" } } },
  },
  triggerInline: { display: { default: null, "@supports selector(::details-content)": { "@media (min-width: 47.5rem)": "none" } } },
  panelInline: {
    display: { default: null, "@supports selector(::details-content)": { "@media (min-width: 47.5rem)": "block" } },
    position: { default: null, "@supports selector(::details-content)": { "@media (min-width: 47.5rem)": "static" } },
    // Match the panel's logical axes so the conditional reset shares their
    // compiled priority layer; a padding shorthand loses to those longhands.
    "padding-block": { default: null, "@supports selector(::details-content)": { "@media (min-width: 47.5rem)": 0 } },
    "padding-inline": { default: null, "@supports selector(::details-content)": { "@media (min-width: 47.5rem)": 0 } },
    borderWidth: { default: null, "@supports selector(::details-content)": { "@media (min-width: 47.5rem)": 0 } },
    "inline-size": { default: null, "@supports selector(::details-content)": { "@media (min-width: 47.5rem)": "100%" } },
  },
  disclosureTrigger: {
    listStyleType: "none", "inline-size": "fit-content", "max-inline-size": "100%",
    borderRadius: "0.375rem", "margin-inline-start": 0,
    fontSize: { default: "0.75rem", "@media (min-width: 47.5rem)": "0.8125rem" },
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    "padding-inline": "0.625rem",
    display: { default: "inline-grid", "::-webkit-details-marker": "none" },
    gridTemplateAreas: '"label"', justifyItems: "center",
    backgroundImage: { default: holographicBackgroundImage, [stylex.when.ancestor("[open]", disclosureMarker)]: "none", "@media (forced-colors: active)": "none" },
    boxShadow: { [stylex.when.ancestor("[open]", disclosureMarker)]: "none" },
    borderColor: { default: "transparent", [stylex.when.ancestor("[open]", disclosureMarker)]: "var(--hraness-site-footer-line)", "@media (forced-colors: active)": "ButtonText" },
    color: { default: "var(--hraness-site-footer-foreground)", [stylex.when.ancestor("[open]", disclosureMarker)]: "var(--hraness-site-footer-muted)" },
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
    "--footer-foil-glow": { default: "0", "@media (hover: hover)": { ":hover:not(:disabled)": "1" } },
    borderWidth: "2px",
    borderColor: { default: "transparent", "@media (forced-colors: active)": "ButtonText" },
    backgroundColor: "var(--hraness-site-footer-background)",
    color: "var(--hraness-site-footer-foreground)",
    backgroundImage: {
      default: holographicBackgroundImage,
      "@media (forced-colors: active)": "none",
    },
    backgroundOrigin: "border-box",
    backgroundClip: holographicBackgroundClip,
    boxShadow: { default: "0 0 0.375rem hsl(var(--footer-foil-angle, 135deg) 55% 75% / 0.3)", "@media (forced-colors: active)": "none" },
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
  motion: {
    transitionProperty: { default: null, "@media (prefers-reduced-motion: no-preference)": "color, background-color, opacity" },
    transitionDuration: { default: null, "@media (prefers-reduced-motion: no-preference)": "120ms" },
    transitionTimingFunction: { default: null, "@media (prefers-reduced-motion: no-preference)": "ease" },
    transitionDelay: { default: null, "@media (prefers-reduced-motion: no-preference)": "0s" },
  },
  inner: {
    containerName: "hraness-footer", containerType: "inline-size",
    position: "relative", display: "grid",
    gridTemplateAreas: { default: '"brand links"', "@media (min-width: 47.5rem)": '"brand consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, 1fr)", "@media (min-width: 47.5rem)": "auto auto minmax(0, 1fr)" },
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
    gridTemplateAreas: { default: '"brand mailing links"', "@media (min-width: 47.5rem)": '"brand mailing consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, max-content) minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto minmax(10rem, 18rem) auto minmax(var(--hraness-site-footer-social-target), 1fr)" },
    gridTemplateRows: "var(--hraness-site-footer-content-block-size)",
  },
  innerAccount: {
    gridTemplateAreas: { default: '"brand mailing links"', "@media (min-width: 47.5rem)": '"brand mailing consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, max-content) minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto minmax(0, max-content) auto minmax(var(--hraness-site-footer-social-target), 1fr)" },
  },
  account: {
    gridArea: "mailing", display: "inline-flex", alignItems: "center", justifyContent: "center",
    "min-inline-size": 0, "max-inline-size": "12rem", "padding-inline": "0.625rem",
    borderRadius: "0.375rem", color: "var(--hraness-site-footer-muted)",
    fontSize: "0.8125rem", fontWeight: 500, lineHeight: 1, textDecoration: "none",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  innerSupport: {
    gridTemplateAreas: { default: '"brand support links"', "@media (min-width: 47.5rem)": '"brand support consent links"' },
    gridTemplateColumns: { default: "auto auto minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto auto auto minmax(var(--hraness-site-footer-social-target), 1fr)" },
  },
  innerSignupSupport: {
    gridTemplateAreas: { default: '"brand mailing support links"', "@media (min-width: 47.5rem)": '"brand mailing support consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, max-content) auto minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto minmax(10rem, 18rem) auto auto minmax(var(--hraness-site-footer-social-target), 1fr)" },
  },
  innerAccountSupport: {
    gridTemplateAreas: { default: '"brand mailing support links"', "@media (min-width: 47.5rem)": '"brand mailing support consent links"' },
    gridTemplateColumns: { default: "auto minmax(0, max-content) auto minmax(var(--hraness-site-footer-social-target), 1fr)", "@media (min-width: 47.5rem)": "auto minmax(0, max-content) auto auto minmax(var(--hraness-site-footer-social-target), 1fr)" },
  },
  support: {
    gridArea: "support", display: "inline-flex", alignItems: "center", justifyContent: "center",
    "min-inline-size": "2.75rem", "padding-inline": "0.375rem", borderRadius: "0.375rem",
    color: "var(--hraness-site-footer-muted)", fontSize: "0.8125rem", fontWeight: 500,
    lineHeight: 1, textDecoration: "underline", textUnderlineOffset: "0.2em", whiteSpace: "nowrap",
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
  mailing: { position: "relative", display: "grid", gridTemplateRows: "var(--hraness-site-footer-control-block-size)" },
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
    fontSize: { default: "0.8125rem", "@media (max-width: 47.499rem), (pointer: coarse)": "max(1rem, 16px)" },
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
    opacity: { default: null, ":disabled": 0.62 },
    fontWeight: 650, fontSize: "0.8125rem", "padding-inline": "0.625rem", "max-inline-size": "55%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "center",
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
  account: className("hraness-site-footer__account", styles.box, styles.backgroundReset, styles.border, styles.control, styles.account, styles.focus),
  support: className("hraness-site-footer__support", styles.box, styles.control, styles.support, styles.focus),
  disclosure: `${className("hraness-site-footer__disclosure", styles.disclosure)} ${stylex.props(disclosureMarker).className}`,
  disclosureTrigger: className("hraness-site-footer__disclosure-trigger", styles.box, styles.border, styles.control, styles.mailingSubmit, styles.holographic, styles.disclosureTrigger, styles.focus, styles.motion),
  triggerClosed: className("hraness-site-footer__disclosure-closed-label", styles.triggerClosed),
  triggerOpen: className("hraness-site-footer__disclosure-open-label", styles.triggerOpen),
  disclosurePanel: className("hraness-site-footer__disclosure-panel", styles.box, styles.border, styles.disclosurePanel),
  shimmer: className("hraness-site-footer__shimmer", styles.shimmer),
  brand: className("hraness-site-footer__brand", styles.flexCenter, styles.fixedFlex, styles.brand, styles.focus, styles.motion),
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
  mailing: className("hraness-site-footer__mailing", styles.box, styles.mailingGeometry, styles.mailing),
  honeypot: className("hraness-site-footer__honeypot", styles.visuallyHidden),
  mailingControls: className("hraness-site-footer__mailing-controls", styles.box, styles.mailingControls),
  mailingLabel: className("hraness-site-footer__mailing-label", styles.box, styles.mailingLabel),
  mailingInput: className("hraness-site-footer__mailing-input", styles.box, styles.backgroundReset, styles.border, styles.experimentBorder, styles.control, styles.mailingInput, styles.focus),
  mailingSubmit: className("hraness-site-footer__mailing-submit", styles.box, styles.backgroundReset, styles.border, styles.experimentBorder, styles.control, styles.fixedFlex, styles.mailingSubmit, styles.holographic, styles.focus, styles.motion),
  mailingConfirmation: className("hraness-site-footer__mailing-confirmation", styles.box, styles.backgroundReset, styles.border, styles.mailingGeometry, styles.flexCenter, styles.mailingConfirmation, styles.compactConfirmation, styles.focus),
  visuallyHidden: className("hraness-site-footer__visually-hidden", styles.visuallyHidden),
};

export function footerClassName(signup: boolean, sticky = true): string {
  return className("hraness-site-footer", styles.root, signup && styles.signup, sticky && styles.stickyFootprint);
}

export function footerInnerClassName(signup: boolean, sticky = true, color: FooterVariant["color"] = "green", account = false, support = false): string {
  const colorStyle = color === "orange" ? styles.orange : color === "blue" ? styles.blue : styles.green;
  return className("hraness-site-footer__inner", styles.box, styles.backgroundReset, styles.inner, signup && styles.innerSignup, account && styles.innerAccount, support && styles.innerSupport, support && signup && styles.innerSignupSupport, support && account && styles.innerAccountSupport, sticky && styles.stickyBar, signup && colorStyle);
}

export function socialItemClassName(index = 0): string {
  return className("hraness-site-footer__social-item", styles.socialItem,
    index === 1 ? styles.socialSecond : index === 2 ? styles.socialThird : index === 3 ? styles.socialFourth : styles.socialAlways);
}

export function mailingStatusClassName(state: string): string {
  return className("hraness-site-footer__mailing-status", styles.box, styles.backgroundReset, styles.border, styles.mailingStatus, styles.focus,
    state !== "idle" && styles.statusVisible,
    state === "error" && styles.statusError);
}

export function disclosureClassNames(layout: FooterVariant["layout"]): { root: string; trigger: string; panel: string } {
  return {
    root: `${footerClasses.disclosure} ${layout === "inline" ? stylex.props(styles.disclosureInline).className : ""}`.trim(),
    trigger: `${footerClasses.disclosureTrigger} ${layout === "inline" ? stylex.props(styles.triggerInline).className : ""}`.trim(),
    panel: `${footerClasses.disclosurePanel} ${layout === "inline" ? stylex.props(styles.panelInline).className : ""}`.trim(),
  };
}
