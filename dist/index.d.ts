import type { SupportProfile } from "./internal.js";
export type { SupportProfile } from "./internal.js";
export type { HranessFooterConversionEvent, HranessFooterConversionStage, HranessFooterConversionReason } from "./internal.js";
import { type FooterVariant } from "./experiment.js";
export { resolveFooterLocale } from "./locales.js";
export type { FooterLocale, FooterMessages, FooterCopyStyle } from "./locales.js";
export { parseFooterEnrollment, parseFooterVariant } from "./experiment.js";
export type { FooterEnrollment, FooterVariant } from "./experiment.js";
import { HRANESS_MAILING_SUBSCRIBE_URL, HRANESS_ACCOUNT_URL, type HranessMailingListConfig, type HranessSocialConfig, type HranessSocialLink, type HranessSocialLinkOverride, type HranessSocialPlatform } from "./internal.js";
export declare const HRANESS_HOME_URL = "https://hraness.com/";
export { HRANESS_MAILING_SUBSCRIBE_URL, HRANESS_ACCOUNT_URL };
/** Canonical, immutable social-profile order shared by every Hraness website. */
export declare const hranessSocialLinks: ReadonlyArray<HranessSocialLink>;
export type { HranessMailingListConfig, HranessSocialConfig, HranessSocialLink, HranessSocialLinkOverride, HranessSocialPlatform, };
export interface HranessSiteFooterOptions {
    /** Explicit Accounts product identity. Omit to render no paid-support control. */
    readonly support?: SupportProfile;
    readonly locale?: string | readonly string[];
    readonly placement?: "sticky" | "flow";
    /** A server may provide a checked experiment assignment; static rendering makes no analytics request. */
    readonly variant?: FooterVariant;
    /** Select signup, the signed-in account link, or no account/signup control. */
    readonly mailingList: HranessMailingListConfig;
    /** Omit the Hraness home link when the containing site already supplies that identity. */
    readonly showBrand?: boolean;
    /**
     * True only when this site keeps visitors signed in with cookies. The cookie
     * note mentions sign-in only when it is true. Defaults to false.
     */
    readonly signIn?: boolean;
    /**
     * Retarget owned social destinations without adding platforms or changing
     * order. Defaults remain the shared Hraness profiles.
     */
    readonly social?: HranessSocialConfig;
}
/** Render the complete framework-neutral Hraness network footer. */
export declare function renderHranessSiteFooter({ locale: localeInput, placement, variant, mailingList: mailingListInput, showBrand, signIn, social: socialInput, support, }: HranessSiteFooterOptions): string;
//# sourceMappingURL=index.d.ts.map