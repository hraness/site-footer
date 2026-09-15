/**
 * Canonical copy for the shared mailing-signup surface only.
 * See docs/localization.md for evidence, register choices and fallback rules.
 * These are reviewed-as-code translation drafts, not native-speaker validation.
 */
export declare const FOOTER_COPY_STYLES: readonly ["direct", "inviting", "goblin", "cosmic", "chaos", "secret"];
export type FooterCopyStyle = typeof FOOTER_COPY_STYLES[number];
export type LocalizedFooterCopyStyle = "direct" | "inviting";
/** Paired hypotheses stay stable within an enrollment; never randomize each render. */
export declare const ENGLISH_FOOTER_COPY: Readonly<{
    readonly direct: {
        readonly button: "Send me things";
        readonly placeholder: "Your email";
    };
    readonly inviting: {
        readonly button: "I'm curious";
        readonly placeholder: "curious@plot.twist";
    };
    readonly goblin: {
        readonly button: "Feed the goblin";
        readonly placeholder: "goblin@snack.club";
    };
    readonly cosmic: {
        readonly button: "Beam me up";
        readonly placeholder: "earthling@probably.earth";
    };
    readonly chaos: {
        readonly button: "Push the button";
        readonly placeholder: "chaos@inbox.party";
    };
    readonly secret: {
        readonly button: "Let me in";
        readonly placeholder: "agent@secret.lair";
    };
}>;
export declare function isFooterCopyStyle(value: unknown): value is FooterCopyStyle;
export declare function supportsFooterCopyStyle(locale: string, style: FooterCopyStyle): boolean;
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
    styles: Readonly<Record<LocalizedFooterCopyStyle, FooterMessages>> & Readonly<Partial<Record<FooterCopyStyle, FooterMessages>>>;
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