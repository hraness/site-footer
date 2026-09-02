import {
  BlueskyIcon,
  GithubIcon,
  InstagramIcon,
  Linkedin01Icon,
  NewTwitterIcon,
  RedditIcon,
  ThreadsIcon,
  TiktokIcon,
  TwitchIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";

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
export const HRANESS_TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";
export const HRANESS_TURNSTILE_SCRIPT_SLOT = "hraness-turnstile-script";
export const HRANESS_TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";
export const HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL = `${HRANESS_TURNSTILE_SCRIPT_URL}?render=explicit`;
export const HRANESS_TURNSTILE_WIDGET_SLOT = "hraness-turnstile-widget";

const MAX_AUDIENCE_LENGTH = 24;
const MIN_TURNSTILE_SITEKEY_LENGTH = 20;
const MAX_TURNSTILE_SITEKEY_LENGTH = 100;
const MIN_TURNSTILE_SCRIPT_NONCE_LENGTH = 16;
const MAX_TURNSTILE_SCRIPT_NONCE_LENGTH = 256;
const AUDIENCE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const TURNSTILE_SITEKEY_PATTERN = /^[A-Za-z0-9_-]+$/u;
const TURNSTILE_SCRIPT_NONCE_PATTERN = /^[A-Za-z0-9+/_-]+={0,2}$/u;

export type HranessMailingListConfig =
  | Readonly<{
    audience: string;
    kind: "signup";
    turnstileSitekey: string;
  }>
  | Readonly<{
    kind: "none";
  }>;

export type HranessMailingListRenderState =
  | Readonly<{ kind: "idle" }>
  | Readonly<{ audience: string; email: string; kind: "pending" }>
  | Readonly<{ audience: string; kind: "accepted" }>
  | Readonly<{ audience: string; email: string; kind: "error" }>
  | Readonly<{ audience: string; email: string; kind: "verification-error" }>;

export type HranessSocialPlatform =
  | "substack"
  | "x"
  | "instagram"
  | "linkedin"
  | "bluesky"
  | "threads"
  | "github"
  | "tiktok"
  | "reddit"
  | "twitch"
  | "youtube";

export interface HranessSocialLink {
  readonly platform: HranessSocialPlatform;
  readonly label: string;
  readonly title: string;
  readonly href: string;
}

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
    platform: "instagram",
    label: "Hraness on Instagram",
    title: "Instagram",
    href: "https://www.instagram.com/hraness/",
  },
  {
    platform: "linkedin",
    label: "Ben Guo on LinkedIn",
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/hraness",
  },
  {
    platform: "bluesky",
    label: "Hraness on Bluesky",
    title: "Bluesky",
    href: "https://bsky.app/profile/hraness.bsky.social",
  },
  {
    platform: "threads",
    label: "Hraness on Threads",
    title: "Threads",
    href: "https://www.threads.com/@hraness",
  },
  {
    platform: "github",
    label: "Hraness on GitHub",
    title: "GitHub",
    href: "https://github.com/hraness",
  },
  {
    platform: "tiktok",
    label: "Hraness on TikTok",
    title: "TikTok",
    href: "https://www.tiktok.com/@hraness",
  },
  {
    platform: "reddit",
    label: "Ben Guo on Reddit",
    title: "Reddit",
    href: "https://www.reddit.com/user/bgdotjpg/",
  },
  {
    platform: "twitch",
    label: "Hraness on Twitch",
    title: "Twitch",
    href: "https://www.twitch.tv/hranessdotcom",
  },
  {
    platform: "youtube",
    label: "Hraness on YouTube",
    title: "YouTube",
    href: "https://www.youtube.com/@hraness",
  },
] as const satisfies ReadonlyArray<HranessSocialLink>;

const SUBSTACK_ICON = [["path", {
  d: "M22.539 8.242H1.46V5.406h21.08v2.836ZM1.46 10.812v2.836h21.08v-2.836H1.46ZM22.54 16.218V24L12 18.11 1.46 24v-7.782h21.08ZM1.46 0v2.836h21.08V0H1.46Z",
  fill: "currentColor",
}]] as const satisfies IconDefinition;

const ICONS: Readonly<Record<HranessSocialPlatform, IconDefinition>> = {
  substack: SUBSTACK_ICON,
  x: NewTwitterIcon as unknown as IconDefinition,
  instagram: InstagramIcon as unknown as IconDefinition,
  linkedin: Linkedin01Icon as unknown as IconDefinition,
  bluesky: BlueskyIcon as unknown as IconDefinition,
  threads: ThreadsIcon as unknown as IconDefinition,
  github: GithubIcon as unknown as IconDefinition,
  tiktok: TiktokIcon as unknown as IconDefinition,
  reddit: RedditIcon as unknown as IconDefinition,
  twitch: TwitchIcon as unknown as IconDefinition,
  youtube: YoutubeIcon as unknown as IconDefinition,
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
    || !("turnstileSitekey" in value)
    || typeof value.turnstileSitekey !== "string"
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
  if (
    value.turnstileSitekey.length < MIN_TURNSTILE_SITEKEY_LENGTH
    || value.turnstileSitekey.length > MAX_TURNSTILE_SITEKEY_LENGTH
    || !TURNSTILE_SITEKEY_PATTERN.test(value.turnstileSitekey)
  ) {
    throw new TypeError(
      `Hraness mailing-list Turnstile sitekeys must be ${MIN_TURNSTILE_SITEKEY_LENGTH}-${MAX_TURNSTILE_SITEKEY_LENGTH} character URL-safe provider values.`,
    );
  }
  return value;
}

export function parseHranessTurnstileScriptNonce(
  value: string | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  if (
    value.length < MIN_TURNSTILE_SCRIPT_NONCE_LENGTH
    || value.length > MAX_TURNSTILE_SCRIPT_NONCE_LENGTH
    || !TURNSTILE_SCRIPT_NONCE_PATTERN.test(value)
  ) {
    throw new TypeError(
      `Hraness Turnstile script nonces must be ${MIN_TURNSTILE_SCRIPT_NONCE_LENGTH}-${MAX_TURNSTILE_SCRIPT_NONCE_LENGTH} character base64 or base64url values.`,
    );
  }
  return value;
}

export function getHranessMailingTurnstileAction(audience: string): string {
  const action = `mailing_${audience.replaceAll("-", "_")}`;
  if (action.length > 32 || !/^[a-z0-9_]+$/u.test(action)) {
    throw new TypeError("Hraness mailing-list audience cannot produce a valid Turnstile action.");
  }
  return action;
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
  return `<svg aria-hidden="true" class="hraness-site-footer__social-icon" data-slot="social-icon" fill="none" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${renderIconPaths(ICONS[platform])}</svg>`;
}

const RA_MARK = '<svg aria-hidden="true" class="hraness-site-footer__mark" data-slot="hraness-mark" focusable="false" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M372 141a116 116 0 1 1-232 0 116 116 0 1 1 232 0Zm-14 0a102 102 0 1 0-204 0 102 102 0 1 0 204 0Zm-8 0a94 94 0 1 1-188 0 94 94 0 1 1 188 0Z" fill="currentColor" fill-rule="evenodd"></path><path d="M211 252c75-8 154 30 204 94 32 40 51 89 59 142H184c20-28 29-57 22-87-9-39-26-71-28-99-2-22 9-39 33-50Z" fill="currentColor"></path><path d="M246 270c-27-20-67-23-100-9-25 11-42 31-46 56l-34 20 38 12c4 25 14 47 31 66 15 13 22 32 18 56l-14 17h116c-20-27-23-50-8-68 6-8 14-14 23-21 23-20 34-50 28-79-5-22-23-40-52-50ZM132 309c9-14 22-22 38-22 13 0 25 7 34 19-10 14-23 22-39 22-14 0-25-6-33-19Z" fill="currentColor" fill-rule="evenodd"></path><path d="M151 410c-2 30-16 57-43 78h197c-19-27-40-49-63-63-28-18-59-23-91-15Z" fill="currentColor"></path><circle cx="166" cy="307" fill="currentColor" r="8"></circle></svg>';

const HRANESS_SITE_FOOTER_BRAND_HTML = `<a aria-label="Hraness home" class="hraness-site-footer__brand" href="https://hraness.com/">${RA_MARK}<span class="hraness-site-footer__wordmark">hraness</span></a>`;
const HRANESS_SITE_FOOTER_LINKS_HTML = `<nav aria-label="Hraness links" class="hraness-site-footer__links"><ul class="hraness-site-footer__socials">${HRANESS_SOCIAL_LINKS.map((link) => `<li><a aria-label="${escapeAttribute(link.label)}" class="hraness-site-footer__social-link" href="${escapeAttribute(link.href)}" rel="me" title="${escapeAttribute(link.title)}">${renderSocialIcon(link.platform)}</a></li>`).join("")}</ul></nav>`;

const MAILING_IDLE_STATE = { kind: "idle" } as const satisfies HranessMailingListRenderState;

function renderMailingList(
  mailingList: Extract<HranessMailingListConfig, { kind: "signup" }>,
  state: HranessMailingListRenderState,
  turnstileMode: "explicit" | "implicit",
): string {
  if (state.kind === "accepted") {
    return `<div aria-atomic="true" aria-live="polite" class="hraness-site-footer__mailing-confirmation" data-slot="${HRANESS_MAILING_STATUS_SLOT}" data-state="accepted" id="${HRANESS_MAILING_STATUS_SLOT}" role="status" tabindex="-1">Check your email to confirm</div>`;
  }

  const stateKind = state.kind;
  const email = state.kind === "pending"
    || state.kind === "error"
    || state.kind === "verification-error"
    ? ` value="${escapeAttribute(state.email)}"`
    : "";
  const pendingAttributes = state.kind === "pending"
    ? ' aria-busy="true"'
    : "";
  const verificationRetry = turnstileMode === "explicit"
    && state.kind === "verification-error";
  const verificationPending = turnstileMode === "explicit"
    && state.kind !== "pending"
    && !verificationRetry;
  const buttonAttributes = state.kind === "pending" || verificationPending
    ? ' aria-disabled="true" disabled=""'
    : "";
  const buttonLabel = state.kind === "pending"
    ? "Subscribing…"
    : verificationRetry
    ? "Retry security check"
    : verificationPending
    ? "Verifying…"
    : "Subscribe";
  const statusAttributes = state.kind === "error" || state.kind === "verification-error"
    ? ' aria-live="assertive" role="alert"'
    : ' aria-live="polite" role="status"';
  const statusCopy = state.kind === "pending"
    ? "Submitting your email…"
    : state.kind === "error"
    ? "Couldn't subscribe. Try again."
    : state.kind === "verification-error"
    ? "Security check failed. Try again."
    : "";
  const turnstileAction = getHranessMailingTurnstileAction(mailingList.audience);
  const implicitClass = turnstileMode === "implicit" ? " cf-turnstile" : "";
  const turnstile = `<div class="hraness-site-footer__turnstile${implicitClass}" data-action="${turnstileAction}" data-appearance="interaction-only" data-execution="render" data-refresh-expired="auto" data-refresh-timeout="auto" data-response-field="true" data-response-field-name="${HRANESS_TURNSTILE_RESPONSE_FIELD}" data-retry="auto" data-sitekey="${escapeAttribute(mailingList.turnstileSitekey)}" data-size="flexible" data-slot="${HRANESS_TURNSTILE_WIDGET_SLOT}" data-theme="auto"></div>`;

  return `<form accept-charset="UTF-8" action="${HRANESS_MAILING_SUBSCRIBE_URL}" aria-label="Subscribe by email" class="hraness-site-footer__mailing" data-slot="${HRANESS_MAILING_FORM_SLOT}" data-state="${stateKind}" enctype="multipart/form-data" method="post"${pendingAttributes}><input name="audience" type="hidden" value="${escapeAttribute(mailingList.audience)}"><input name="source" type="hidden" value="${HRANESS_MAILING_SOURCE}"><div class="hraness-site-footer__mailing-controls"><label class="hraness-site-footer__mailing-label"><span class="hraness-site-footer__visually-hidden">Email address</span><input aria-describedby="${HRANESS_MAILING_STATUS_SLOT}" autocomplete="email" autocapitalize="none" class="hraness-site-footer__mailing-input" inputmode="email" name="email" placeholder="Email address" required="" spellcheck="false" type="email"${email}></label><button class="hraness-site-footer__mailing-submit" data-slot="${HRANESS_MAILING_FORM_SLOT}-submit" type="submit"${buttonAttributes}>${buttonLabel}</button></div>${turnstile}<p aria-atomic="true" class="hraness-site-footer__mailing-status" data-slot="${HRANESS_MAILING_STATUS_SLOT}" id="${HRANESS_MAILING_STATUS_SLOT}" tabindex="-1"${statusAttributes}>${statusCopy}</p></form>`;
}

export function renderHranessSiteFooterInnerHtml(
  showBrand: boolean,
  mailingList: HranessMailingListConfig,
  state: HranessMailingListRenderState = MAILING_IDLE_STATE,
  turnstileMode: "explicit" | "implicit" = "implicit",
  turnstileScriptNonce?: string,
): string {
  const mailingHtml = mailingList.kind === "none"
    ? ""
    : renderMailingList(
      mailingList,
      state.kind !== "idle" && state.audience === mailingList.audience
        ? state
        : MAILING_IDLE_STATE,
      turnstileMode,
    );
  const turnstileScript = mailingList.kind === "signup" && turnstileMode === "implicit"
    ? `<script async="" data-slot="${HRANESS_TURNSTILE_SCRIPT_SLOT}" defer=""${turnstileScriptNonce === undefined ? "" : ` nonce="${escapeAttribute(turnstileScriptNonce)}"`} src="${HRANESS_TURNSTILE_SCRIPT_URL}"></script>`
    : "";
  return `<div class="hraness-site-footer__inner">${showBrand ? HRANESS_SITE_FOOTER_BRAND_HTML : ""}${mailingHtml}${HRANESS_SITE_FOOTER_LINKS_HTML}</div>${turnstileScript}`;
}
