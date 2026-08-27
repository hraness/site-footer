import {
  HRANESS_FOOTER_CLASS_NAME,
  HRANESS_FOOTER_LABEL,
  HRANESS_FOOTER_SLOT,
  HRANESS_SOCIAL_LINKS,
  renderHranessSiteFooterInnerHtml,
  type HranessSocialLink,
  type HranessSocialPlatform,
} from "./internal.js";

export const HRANESS_HOME_URL = "https://hraness.com/";
export const HRANESS_NEWSLETTER_URL = "https://hraness.substack.com/subscribe";

/** Canonical, immutable social-profile order shared by every Hraness website. */
export const hranessSocialLinks: ReadonlyArray<HranessSocialLink> = HRANESS_SOCIAL_LINKS;

export type { HranessSocialLink, HranessSocialPlatform };

export interface HranessSiteFooterOptions {
  /** Omit the Hraness home link when the containing site already supplies that identity. */
  readonly showBrand?: boolean;
}

/** Render the complete framework-neutral Hraness network footer. */
export function renderHranessSiteFooter({ showBrand = true }: HranessSiteFooterOptions = {}): string {
  return `<footer aria-label="${HRANESS_FOOTER_LABEL}" class="${HRANESS_FOOTER_CLASS_NAME}" data-brand="${showBrand ? "visible" : "hidden"}" data-slot="${HRANESS_FOOTER_SLOT}">${renderHranessSiteFooterInnerHtml(showBrand)}</footer>`;
}
