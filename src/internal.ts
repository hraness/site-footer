import { footerClasses, footerInnerClassName, mailingStatusClassName, socialItemClassName } from "./footer.stylex.js";
import {
  GithubIcon,
  Linkedin01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";

import { DEFAULT_FOOTER_VARIANT, type FooterVariant } from "./experiment.js";
import { resolveFooterLocale, type FooterLocale } from "./locales.js";

export interface FooterPresentation {
  readonly locale: FooterLocale;
  readonly variant: FooterVariant;
  readonly sticky: boolean;
}

export const DEFAULT_FOOTER_PRESENTATION: FooterPresentation = {
  locale: resolveFooterLocale(), variant: DEFAULT_FOOTER_VARIANT, sticky: true,
};

type IconAttributeValue = boolean | number | string;
type IconAttributes = Readonly<Record<string, IconAttributeValue>>;
type IconDefinition = ReadonlyArray<readonly ["path", IconAttributes]>;

export const HRANESS_FOOTER_LABEL = "Hraness network";
export const HRANESS_FOOTER_CLASS_NAME = "hraness-site-footer";
export const HRANESS_FOOTER_SLOT = "hraness-site-footer";
export const HRANESS_MAILING_FORM_SLOT = "hraness-mailing-list-signup";
export const HRANESS_MAILING_SOURCE = "hraness-site-footer";
export const HRANESS_MAILING_STATUS_SLOT = "hraness-mailing-list-status";
export const HRANESS_MAILING_SUBSCRIBE_URL = "https://account.hraness.com/api/mailing/subscribe";
export const HRANESS_MAILING_HONEYPOT_FIELD = "website";

const MAX_AUDIENCE_LENGTH = 24;
const MAX_SOCIAL_HREF_LENGTH = 200;
const MAX_SOCIAL_LABEL_LENGTH = 64;
const AUDIENCE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const SOCIAL_LABEL_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} .'+/-]{0,62}$/u;
const SOCIAL_HREF_HOSTS: Readonly<Record<HranessSocialPlatform, string>> = {
  github: "github.com",
  linkedin: "www.linkedin.com",
  substack: "substack.com",
  x: "x.com",
};
const SOCIAL_HREF_PATHS: Readonly<Record<HranessSocialPlatform, RegExp>> = {
  github: /^\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)?$/u,
  linkedin: /^\/(?:company|in)\/[A-Za-z0-9_-]+$/u,
  substack: /^\/@[A-Za-z0-9_-]+$/u,
  x: /^\/[A-Za-z0-9_]{1,15}$/u,
};

export type HranessMailingListConfig =
  | Readonly<{
    audience: string;
    kind: "signup";
  }>
  | Readonly<{
    kind: "none";
  }>;

export type HranessMailingListRenderState =
  | Readonly<{ kind: "idle" }>
  | Readonly<{ audience: string; email: string; kind: "pending" }>
  | Readonly<{ audience: string; kind: "accepted" }>
  | Readonly<{ audience: string; email: string; kind: "error" }>;

export type HranessSocialPlatform =
  | "substack"
  | "x"
  | "linkedin"
  | "github";

export const HRANESS_SOCIAL_PLATFORMS = [
  "substack",
  "x",
  "linkedin",
  "github",
] as const satisfies ReadonlyArray<HranessSocialPlatform>;

export interface HranessSocialLink {
  readonly platform: HranessSocialPlatform;
  readonly label: string;
  readonly title: string;
  readonly href: string;
}

export interface HranessSocialLinkOverride {
  readonly href: string;
  readonly label?: string;
}

export type HranessSocialConfig = Readonly<
  Partial<Record<HranessSocialPlatform, HranessSocialLinkOverride>>
>;

export const HRANESS_SOCIAL_LINKS = [
  {
    platform: "substack",
    label: "Hraness on Substack",
    title: "Substack",
    href: "https://substack.com/@hraness",
  },
  {
    platform: "x",
    label: "Hraness on X",
    title: "X",
    href: "https://x.com/hraness",
  },
  {
    platform: "linkedin",
    label: "Hraness on LinkedIn",
    title: "LinkedIn",
    href: "https://www.linkedin.com/company/hraness",
  },
  {
    platform: "github",
    label: "Hraness on GitHub",
    title: "GitHub",
    href: "https://github.com/hraness",
  },
] as const satisfies ReadonlyArray<HranessSocialLink>;

const SUBSTACK_ICON = [["path", {
  d: "M22.539 8.242H1.46V5.406h21.08v2.836ZM1.46 10.812v2.836h21.08v-2.836H1.46ZM22.54 16.218V24L12 18.11 1.46 24v-7.782h21.08ZM1.46 0v2.836h21.08V0H1.46Z",
  fill: "currentColor",
}]] as const satisfies IconDefinition;

const ICONS: Readonly<Record<HranessSocialPlatform, IconDefinition>> = {
  substack: SUBSTACK_ICON,
  x: NewTwitterIcon as unknown as IconDefinition,
  linkedin: Linkedin01Icon as unknown as IconDefinition,
  github: GithubIcon as unknown as IconDefinition,
};

const ATTRIBUTE_NAMES: Readonly<Record<string, string>> = {
  d: "d",
  fill: "fill",
  fillRule: "fill-rule",
  stroke: "stroke",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  strokeWidth: "stroke-width",
};

function escapeAttribute(value: IconAttributeValue): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function parseHranessMailingListConfig(
  value: HranessMailingListConfig,
): HranessMailingListConfig {
  if (typeof value !== "object" || value === null || !("kind" in value)) {
    throw new TypeError("Hraness site footer mailingList must be explicitly configured.");
  }
  if (value.kind === "none") return value;
  if (
    value.kind !== "signup"
    || typeof value.audience !== "string"
  ) {
    throw new TypeError("Hraness site footer mailingList configuration is invalid.");
  }
  if (
    value.audience.length === 0
    || value.audience.length > MAX_AUDIENCE_LENGTH
    || value.audience.trim() !== value.audience
    || !AUDIENCE_PATTERN.test(value.audience)
  ) {
    throw new TypeError(
      `Hraness mailing-list audience IDs must be canonical lowercase slugs of at most ${MAX_AUDIENCE_LENGTH} characters.`,
    );
  }
  return value;
}

function isHranessSocialPlatform(value: string): value is HranessSocialPlatform {
  return (HRANESS_SOCIAL_PLATFORMS as readonly string[]).includes(value);
}

function parseHranessSocialHref(
  platform: HranessSocialPlatform,
  href: string,
): string {
  if (href.length === 0 || href.length > MAX_SOCIAL_HREF_LENGTH) {
    throw new TypeError(
      "Hraness site footer social hrefs must be canonical https profile URLs.",
    );
  }

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    throw new TypeError(
      "Hraness site footer social hrefs must be canonical https profile URLs.",
    );
  }

  if (
    url.protocol !== "https:"
    || url.username !== ""
    || url.password !== ""
    || url.port !== ""
    || url.search !== ""
    || url.hash !== ""
    || url.hostname !== SOCIAL_HREF_HOSTS[platform]
    || !SOCIAL_HREF_PATHS[platform].test(url.pathname)
    || url.href !== href
  ) {
    throw new TypeError(
      "Hraness site footer social hrefs must be canonical https profile URLs.",
    );
  }

  return href;
}

function parseHranessSocialOverride(
  platform: HranessSocialPlatform,
  value: unknown,
): HranessSocialLinkOverride {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Hraness site footer social configuration is invalid.");
  }

  const keys = Object.keys(value);
  if (keys.some((key) => key !== "href" && key !== "label")) {
    throw new TypeError(
      "Hraness site footer social overrides may only set href and label.",
    );
  }
  if (!("href" in value) || typeof value.href !== "string") {
    throw new TypeError("Hraness site footer social configuration is invalid.");
  }

  const href = parseHranessSocialHref(platform, value.href);
  if (!("label" in value) || value.label === undefined) {
    return { href };
  }
  if (typeof value.label !== "string") {
    throw new TypeError(
      "Hraness site footer social labels must be specific accessible names.",
    );
  }
  if (
    value.label.length === 0
    || value.label.length > MAX_SOCIAL_LABEL_LENGTH
    || value.label.trim() !== value.label
    || !SOCIAL_LABEL_PATTERN.test(value.label)
  ) {
    throw new TypeError(
      `Hraness site footer social labels must be specific accessible names of at most ${MAX_SOCIAL_LABEL_LENGTH} characters.`,
    );
  }

  return { href, label: value.label };
}

export function parseHranessSocialConfig(
  value: HranessSocialConfig | undefined,
): HranessSocialConfig {
  if (value === undefined) return {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Hraness site footer social configuration is invalid.");
  }

  const parsed: {
    -readonly [K in HranessSocialPlatform]?: HranessSocialLinkOverride;
  } = {};
  for (const [platform, override] of Object.entries(value)) {
    if (!isHranessSocialPlatform(platform) || override === undefined) {
      throw new TypeError(
        "Hraness site footer social overrides may only retarget substack, x, linkedin, or github.",
      );
    }
    parsed[platform] = parseHranessSocialOverride(platform, override);
  }
  return parsed;
}

export function resolveHranessSocialLinks(
  value: HranessSocialConfig | undefined,
): ReadonlyArray<HranessSocialLink> {
  const overrides = parseHranessSocialConfig(value);
  return HRANESS_SOCIAL_LINKS.map((link) => {
    const override = overrides[link.platform];
    if (override === undefined) return link;
    return {
      href: override.href,
      label: override.label ?? link.label,
      platform: link.platform,
      title: link.title,
    };
  });
}

function renderIconPaths(icon: IconDefinition): string {
  return icon.map(([tag, attributes]) => {
    if (tag !== "path") {
      throw new TypeError(`Unsupported Hraness footer icon element: ${tag}`);
    }

    const renderedAttributes = Object.entries(attributes)
      .filter(([name]) => name !== "key")
      .map(([name, value]) => {
        const attributeName = ATTRIBUTE_NAMES[name];
        if (attributeName === undefined) {
          throw new TypeError(`Unsupported Hraness footer icon attribute: ${name}`);
        }
        return `${attributeName}="${escapeAttribute(value)}"`;
      })
      .join(" ");

    return `<path ${renderedAttributes}></path>`;
  }).join("");
}

function renderSocialIcon(platform: HranessSocialPlatform): string {
  return `<svg aria-hidden="true" class="${footerClasses.socialIcon}" data-slot="social-icon" fill="none" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${renderIconPaths(ICONS[platform])}</svg>`;
}

const RA_MARK = `<svg aria-hidden="true" class="${footerClasses.mark}" data-slot="hraness-mark" focusable="false" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M372 141a116 116 0 1 1-232 0 116 116 0 1 1 232 0Zm-14 0a102 102 0 1 0-204 0 102 102 0 1 0 204 0Zm-8 0a94 94 0 1 1-188 0 94 94 0 1 1 188 0Z" fill="currentColor" fill-rule="evenodd"></path><path d="M211 252c75-8 154 30 204 94 32 40 51 89 59 142H184c20-28 29-57 22-87-9-39-26-71-28-99-2-22 9-39 33-50Z" fill="currentColor"></path><path d="M246 270c-27-20-67-23-100-9-25 11-42 31-46 56l-34 20 38 12c4 25 14 47 31 66 15 13 22 32 18 56l-14 17h116c-20-27-23-50-8-68 6-8 14-14 23-21 23-20 34-50 28-79-5-22-23-40-52-50ZM132 309c9-14 22-22 38-22 13 0 25 7 34 19-10 14-23 22-39 22-14 0-25-6-33-19Z" fill="currentColor" fill-rule="evenodd"></path><path d="M151 410c-2 30-16 57-43 78h197c-19-27-40-49-63-63-28-18-59-23-91-15Z" fill="currentColor"></path><circle cx="166" cy="307" fill="currentColor" r="8"></circle></svg>`;

const HRANESS_SITE_FOOTER_BRAND_HTML = `<a aria-label="Hraness home" class="${footerClasses.brand}" href="https://hraness.com/">${RA_MARK}</a>`;

function renderHranessSocialLinksHtml(
  socialLinks: ReadonlyArray<HranessSocialLink>,
): string {
  return `<nav aria-label="Hraness links" class="${footerClasses.links}"><ul class="${footerClasses.socials}">${socialLinks.map((link) => `<li class="${socialItemClassName()}"><a aria-label="${escapeAttribute(link.label)}" class="${footerClasses.socialLink}" href="${escapeAttribute(link.href)}" rel="me" title="${escapeAttribute(link.title)}">${renderSocialIcon(link.platform)}</a></li>`).join("")}</ul></nav>`;
}

const MAILING_IDLE_STATE = { kind: "idle" } as const satisfies HranessMailingListRenderState;

function renderMailingList(
  mailingList: Extract<HranessMailingListConfig, { kind: "signup" }>,
  state: HranessMailingListRenderState,
  presentation: FooterPresentation,
): string {
  const { locale, variant } = presentation;
  const copy = locale.styles[variant.copyStyle];
  const localAttributes = ` lang="${escapeAttribute(locale.locale)}" dir="${locale.dir}"`;
  const variantAttributes = ` data-layout="${variant.layout}" data-copy-variant="${variant.copyStyle}" data-color="${variant.color}" data-shimmer="${variant.shimmer}"`;
  if (state.kind === "accepted") {
    return `<div aria-atomic="true" aria-live="polite" class="${footerClasses.mailingConfirmation}" data-slot="${HRANESS_MAILING_STATUS_SLOT}" data-state="accepted" id="${HRANESS_MAILING_STATUS_SLOT}" role="status" tabindex="-1"${localAttributes}>${escapeAttribute(copy.accepted)}</div>`;
  }

  const stateKind = state.kind;
  const email = state.kind === "pending" || state.kind === "error"
    ? ` value="${escapeAttribute(state.email)}"`
    : "";
  const pendingAttributes = state.kind === "pending"
    ? ' aria-busy="true"'
    : "";
  const buttonAttributes = state.kind === "pending"
    ? ' aria-disabled="true" disabled=""'
    : "";
  const buttonLabel = state.kind === "pending" ? copy.pending : copy.button;
  const statusAttributes = state.kind === "error"
    ? ' aria-live="assertive" role="alert"'
    : ' aria-live="polite" role="status"';
  const statusCopy = state.kind === "pending"
    ? copy.submitting
    : state.kind === "error"
    ? copy.requestError
    : "";
  const honeypot = `<input aria-hidden="true" autocomplete="off" class="${footerClasses.honeypot}" name="${HRANESS_MAILING_HONEYPOT_FIELD}" tabindex="-1" type="text" value="">`;

  const form = `<form accept-charset="UTF-8" action="${HRANESS_MAILING_SUBSCRIBE_URL}" aria-label="${escapeAttribute(copy.formLabel)}"${localAttributes}${variantAttributes} class="${footerClasses.mailing}" data-slot="${HRANESS_MAILING_FORM_SLOT}" data-state="${stateKind}" enctype="multipart/form-data" method="post"${pendingAttributes}><input name="audience" type="hidden" value="${escapeAttribute(mailingList.audience)}"><input name="source" type="hidden" value="${HRANESS_MAILING_SOURCE}"><div class="${footerClasses.mailingControls}"><label class="${footerClasses.mailingLabel}"><span class="${footerClasses.visuallyHidden}">${escapeAttribute(copy.emailLabel)}</span><input aria-describedby="${HRANESS_MAILING_STATUS_SLOT}" autocomplete="email" autocapitalize="none" class="${footerClasses.mailingInput}" inputmode="email" name="email" placeholder="${escapeAttribute(copy.placeholder)}" maxlength="254" dir="ltr" required="" spellcheck="false" type="email"${email}></label><button class="${footerClasses.mailingSubmit}" data-slot="${HRANESS_MAILING_FORM_SLOT}-submit" type="submit"${buttonAttributes}>${variant.shimmer ? `<span class="${footerClasses.shimmer}" data-slot="hraness-mailing-button-label">${escapeAttribute(buttonLabel)}</span>` : escapeAttribute(buttonLabel)}</button></div>${honeypot}<p aria-atomic="true" class="${mailingStatusClassName(stateKind)}" data-slot="${HRANESS_MAILING_STATUS_SLOT}" id="${HRANESS_MAILING_STATUS_SLOT}" tabindex="-1"${statusAttributes}>${escapeAttribute(statusCopy)}</p></form>`;
  if (variant.layout === "inline") return form;
  const open = state.kind === "idle" ? "" : " open=\"\"";
  const label = escapeAttribute(copy.button);
  return `<details class="${footerClasses.disclosure}" data-slot="hraness-mailing-disclosure"${localAttributes}${variantAttributes}${open}><summary aria-label="${escapeAttribute(copy.openLabel)}" class="${footerClasses.disclosureTrigger}">${variant.shimmer ? `<span class="${footerClasses.shimmer}">${label}</span>` : label}</summary><div class="${footerClasses.disclosurePanel}">${form}</div></details>`;
}

export function renderHranessSiteFooterInnerHtml(
  showBrand: boolean,
  mailingList: HranessMailingListConfig,
  state: HranessMailingListRenderState = MAILING_IDLE_STATE,
  socialLinks: ReadonlyArray<HranessSocialLink> = HRANESS_SOCIAL_LINKS,
  presentation: FooterPresentation = DEFAULT_FOOTER_PRESENTATION,
): string {
  const mailingHtml = mailingList.kind === "none"
    ? ""
    : renderMailingList(
      mailingList,
      state.kind !== "idle" && state.audience === mailingList.audience
        ? state
        : MAILING_IDLE_STATE,
      presentation,
    );
  return `<div class="${footerInnerClassName(mailingList.kind === "signup", presentation.sticky, presentation.variant.color)}">${showBrand ? HRANESS_SITE_FOOTER_BRAND_HTML : ""}${mailingHtml}${renderHranessSocialLinksHtml(socialLinks)}</div>`;
}
