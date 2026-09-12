import { type FooterVariant } from "./experiment.js";
export { resolveFooterLocale } from "./locales.js";
export type { FooterLocale, FooterMessages, FooterCopyStyle } from "./locales.js";
export { parseFooterEnrollment, parseFooterVariant } from "./experiment.js";
export type { FooterEnrollment, FooterVariant } from "./experiment.js";
import { HRANESS_MAILING_SUBSCRIBE_URL, HRANESS_TURNSTILE_RESPONSE_FIELD, HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL, HRANESS_TURNSTILE_SCRIPT_URL, getHranessMailingTurnstileAction, type HranessMailingListConfig, type HranessSocialConfig, type HranessSocialLink, type HranessSocialLinkOverride, type HranessSocialPlatform } from "./internal.js";
export declare const HRANESS_HOME_URL = "https://hraness.com/";
export { HRANESS_MAILING_SUBSCRIBE_URL, HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL, HRANESS_TURNSTILE_RESPONSE_FIELD, HRANESS_TURNSTILE_SCRIPT_URL, getHranessMailingTurnstileAction, };
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
    /** Optional per-response CSP nonce for the static Turnstile script. */
    readonly turnstileScriptNonce?: string;
}
/** Render the complete framework-neutral Hraness network footer. */
export declare function renderHranessSiteFooter({ locale: localeInput, placement, variant, mailingList: mailingListInput, showBrand, social: socialInput, turnstileScriptNonce: turnstileScriptNonceInput, }: HranessSiteFooterOptions): string;
//# sourceMappingURL=index.d.ts.map