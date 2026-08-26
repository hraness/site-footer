import {
  HRANESS_FOOTER_CLASS_NAME,
  HRANESS_FOOTER_LABEL,
  HRANESS_FOOTER_SLOT,
  HRANESS_SITE_FOOTER_INNER_HTML,
  HRANESS_SOCIAL_LINKS,
  type HranessSocialLink,
  type HranessSocialPlatform,
} from "./internal.js";

export const HRANESS_HOME_URL = "https://hraness.com/";
export const HRANESS_NEWSLETTER_URL = "https://hraness.substack.com/subscribe";

/** Canonical, immutable social-profile order shared by every Hraness website. */
export const hranessSocialLinks: ReadonlyArray<HranessSocialLink> = HRANESS_SOCIAL_LINKS;

export type { HranessSocialLink, HranessSocialPlatform };

/** Render the complete framework-neutral Hraness network footer. */
export function renderHranessSiteFooter(): string {
  return `<footer aria-label="${HRANESS_FOOTER_LABEL}" class="${HRANESS_FOOTER_CLASS_NAME}" data-slot="${HRANESS_FOOTER_SLOT}">${HRANESS_SITE_FOOTER_INNER_HTML}</footer>`;
}

