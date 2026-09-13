import { type FooterVariant } from "./experiment.js";
export { resolveFooterLocale } from "./locales.js";
export type { FooterLocale, FooterMessages, FooterCopyStyle } from "./locales.js";
export { parseFooterEnrollment, parseFooterVariant } from "./experiment.js";
export type { FooterEnrollment, FooterVariant } from "./experiment.js";
import { HRANESS_MAILING_SUBSCRIBE_URL, type HranessMailingListConfig, type HranessSocialConfig, type HranessSocialLink, type HranessSocialLinkOverride, type HranessSocialPlatform } from "./internal.js";
export declare const HRANESS_HOME_URL = "https://hraness.com/";
export { HRANESS_MAILING_SUBSCRIBE_URL };
/** Canonical, immutable social-profile order shared by every Hraness website. */
export declare const hranessSocialLinks: ReadonlyArray<HranessSocialLink>;
export type { HranessMailingListConfig, HranessSocialConfig, HranessSocialLink, HranessSocialLinkOverride, HranessSocialPlatform, };
export interface HranessSiteFooterOptions {
    readonly locale?: string | readonly string[];
    readonly placement?: "sticky" | "flow";
    /** A server may provide a checked experiment assignment; static rendering makes no analytics request. */
    readonly variant?: FooterVariant;
    /** Explicitly select one mailing-list audience or omit mailing-list UI. */
    readonly mailingList: HranessMailingListConfig;
    /** Omit the Hraness home link when the containing site already supplies that identity. */
    readonly showBrand?: boolean;
    /**
     * Retarget owned social destinations without adding platforms or changing
     * order. Defaults remain the shared Hraness profiles.
     */
    readonly social?: HranessSocialConfig;
}
/** Render the complete framework-neutral Hraness network footer. */
export declare function renderHranessSiteFooter({ locale: localeInput, placement, variant, mailingList: mailingListInput, showBrand, social: socialInput, }: HranessSiteFooterOptions): string;
//# sourceMappingURL=index.d.ts.map