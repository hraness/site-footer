/**
 * Canonical copy for the shared mailing-signup surface only.
 * See docs/localization.md for evidence, register choices and fallback rules.
 * These are reviewed-as-code translation drafts, not native-speaker validation.
 */
export type FooterCopyStyle = "direct" | "inviting";
export type FooterMessages = Readonly<{
    button: string;
    placeholder: string;
    emailLabel: string;
    formLabel: string;
    pending: string;
    submitting: string;
    requestError: string;
    accepted: string;
    openLabel: string;
    closeLabel: string;
    invalidEmail: string;
}>;
export type FooterLocale = Readonly<{
    locale: string;
    dir: "ltr" | "rtl";
    styles: Readonly<Record<FooterCopyStyle, FooterMessages>>;
}>;
/** Immutable, canonical BCP 47 locale records. Regional siblings may share wording. */
export declare const FOOTER_LOCALES: Readonly<Record<string, FooterLocale>>;
/**
 * Resolve an explicit locale or ordered preferences. Pure and SSR-safe: callers
 * may pass navigator.languages after hydration, never during a server render.
 * Unknown/malformed preferences are skipped, then deterministic English is used.
 */
export declare function resolveFooterLocale(preferred?: string | readonly string[]): FooterLocale;
//# sourceMappingURL=locales.d.ts.map