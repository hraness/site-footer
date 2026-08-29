import {
  HRANESS_FOOTER_CLASS_NAME,
  HRANESS_FOOTER_LABEL,
  HRANESS_FOOTER_SLOT,
  HRANESS_MAILING_SUBSCRIBE_URL,
  HRANESS_SOCIAL_LINKS,
  HRANESS_TURNSTILE_RESPONSE_FIELD,
  HRANESS_TURNSTILE_SCRIPT_URL,
  getHranessMailingTurnstileAction,
  parseHranessMailingListConfig,
  renderHranessSiteFooterInnerHtml,
  type HranessMailingListConfig,
  type HranessSocialLink,
  type HranessSocialPlatform,
} from "./internal.js";

export const HRANESS_HOME_URL = "https://hraness.com/";
export {
  HRANESS_MAILING_SUBSCRIBE_URL,
  HRANESS_TURNSTILE_RESPONSE_FIELD,
  HRANESS_TURNSTILE_SCRIPT_URL,
  getHranessMailingTurnstileAction,
};

/** Canonical, immutable social-profile order shared by every Hraness website. */
export const hranessSocialLinks: ReadonlyArray<HranessSocialLink> = HRANESS_SOCIAL_LINKS;

export type { HranessMailingListConfig, HranessSocialLink, HranessSocialPlatform };

export interface HranessSiteFooterOptions {
  /** Explicitly select one mailing-list audience or omit mailing-list UI. */
  readonly mailingList: HranessMailingListConfig;
  /** Omit the Hraness home link when the containing site already supplies that identity. */
  readonly showBrand?: boolean;
}

/** Render the complete framework-neutral Hraness network footer. */
export function renderHranessSiteFooter({
  mailingList: mailingListInput,
  showBrand = true,
}: HranessSiteFooterOptions): string {
  const mailingList = parseHranessMailingListConfig(mailingListInput);
  return `<footer aria-label="${HRANESS_FOOTER_LABEL}" class="${HRANESS_FOOTER_CLASS_NAME}" data-brand="${showBrand ? "visible" : "hidden"}" data-mailing-list="${mailingList.kind}" data-slot="${HRANESS_FOOTER_SLOT}" id="${HRANESS_FOOTER_SLOT}">${renderHranessSiteFooterInnerHtml(showBrand, mailingList)}</footer>`;
}
