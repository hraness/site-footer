import { HRANESS_MAILING_SUBSCRIBE_URL, HRANESS_TURNSTILE_RESPONSE_FIELD, HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL, HRANESS_TURNSTILE_SCRIPT_URL, getHranessMailingTurnstileAction, type HranessMailingListConfig, type HranessSocialLink, type HranessSocialPlatform } from "./internal.js";
export declare const HRANESS_HOME_URL = "https://hraness.com/";
export { HRANESS_MAILING_SUBSCRIBE_URL, HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL, HRANESS_TURNSTILE_RESPONSE_FIELD, HRANESS_TURNSTILE_SCRIPT_URL, getHranessMailingTurnstileAction, };
/** Canonical, immutable social-profile order shared by every Hraness website. */
export declare const hranessSocialLinks: ReadonlyArray<HranessSocialLink>;
export type { HranessMailingListConfig, HranessSocialLink, HranessSocialPlatform };
export interface HranessSiteFooterOptions {
    /** Explicitly select one mailing-list audience or omit mailing-list UI. */
    readonly mailingList: HranessMailingListConfig;
    /** Omit the Hraness home link when the containing site already supplies that identity. */
    readonly showBrand?: boolean;
    /** Optional per-response CSP nonce for the static Turnstile script. */
    readonly turnstileScriptNonce?: string;
}
/** Render the complete framework-neutral Hraness network footer. */
export declare function renderHranessSiteFooter({ mailingList: mailingListInput, showBrand, turnstileScriptNonce: turnstileScriptNonceInput, }: HranessSiteFooterOptions): string;
//# sourceMappingURL=index.d.ts.map