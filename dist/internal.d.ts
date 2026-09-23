/** Optional, payload-bounded observations. No event contains visitor input. */
export type HranessFooterConversionStage = "impression" | "open" | "close" | "input_started" | "validation_failed" | "submit" | "accepted" | "error";
export type HranessFooterConversionReason = "dismiss_button" | "escape" | "backdrop" | "invalid_email" | "required_email" | "request_failed" | "network_error";
export interface HranessFooterConversionEvent {
    readonly stage: HranessFooterConversionStage;
    readonly presentationVersion: "stable-modal-v1";
    /** The explicitly configured, validated public mailing-list ID. */
    readonly audience: string;
    /** A canonical locale selected from the package's finite locale catalog. */
    readonly locale: string;
    readonly reason?: HranessFooterConversionReason;
}
import { type FooterVariant } from "./experiment.js";
import { type FooterLocale } from "./locales.js";
/** Portable public shape, checked against the bundled foundation by the release gate. */
export type SupportProfile = Readonly<{
    /** Exact public product ID accepted by the Accounts support page. */
    id: string;
    name: string;
    valueProposition: string;
    /** True only when Accounts has a public mailing list for this product. */
    updates: boolean;
}>;
export interface FooterPresentation {
    readonly support?: SupportProfile;
    readonly locale: FooterLocale;
    readonly variant: FooterVariant;
    readonly sticky: boolean;
    /** True only when the host site keeps visitors signed in with cookies. */
    readonly signIn?: boolean;
    readonly experimentToken?: string;
}
export declare const DEFAULT_FOOTER_PRESENTATION: FooterPresentation;
export declare const HRANESS_FOOTER_LABEL = "Hraness network";
export declare const HRANESS_FOOTER_CLASS_NAME = "hraness-site-footer";
export declare const HRANESS_FOOTER_SLOT = "hraness-site-footer";
export declare const HRANESS_MAILING_FORM_SLOT = "hraness-mailing-list-signup";
export declare const HRANESS_MAILING_SOURCE = "hraness-site-footer";
export declare const HRANESS_MAILING_STATUS_SLOT = "hraness-mailing-list-status";
export declare const HRANESS_MAILING_SUBSCRIBE_URL = "https://account.hraness.com/api/mailing/subscribe";
export declare const HRANESS_ACCOUNT_URL = "https://account.hraness.com/";
export declare const HRANESS_MAILING_HONEYPOT_FIELD = "website";
export declare const HRANESS_CONSENT_REGION_URL = "https://account.hraness.com/api/consent/region";
export declare const HRANESS_CONSENT_STORAGE_KEY = "hraness-consent-cookies-v1";
export declare const HRANESS_CONSENT_SLOT = "hraness-cookie-consent";
export declare const HRANESS_CONSENT_ACCEPT_SLOT = "hraness-cookie-consent-accept";
export type HranessMailingListConfig = Readonly<{
    audience: string;
    kind: "signup";
    /** Product name shown in the English signup dialog, such as "Soundfish". */
    name?: string;
}> | Readonly<{
    kind: "none";
}> | Readonly<{
    kind: "account";
}>;
export type HranessMailingListRenderState = Readonly<{
    kind: "idle";
}> | Readonly<{
    audience: string;
    email: string;
    kind: "pending";
}> | Readonly<{
    audience: string;
    kind: "accepted";
}> | Readonly<{
    audience: string;
    email: string;
    kind: "error";
}>;
export type HranessSocialPlatform = "substack" | "x" | "linkedin" | "github";
export declare const HRANESS_SOCIAL_PLATFORMS: readonly ["substack", "x", "linkedin", "github"];
export interface HranessSocialLink {
    readonly platform: HranessSocialPlatform;
    readonly label: string;
    readonly title: string;
    readonly href: string;
}
export interface HranessSocialLinkOverride {
    readonly href: string;
    readonly label?: string;
}
export type HranessSocialConfig = Readonly<Partial<Record<HranessSocialPlatform, HranessSocialLinkOverride>>>;
export declare const HRANESS_SOCIAL_LINKS: readonly [{
    readonly platform: "substack";
    readonly label: "Hraness on Substack";
    readonly title: "Substack";
    readonly href: "https://substack.com/@hraness";
}, {
    readonly platform: "x";
    readonly label: "Hraness on X";
    readonly title: "X";
    readonly href: "https://x.com/hraness";
}, {
    readonly platform: "linkedin";
    readonly label: "Hraness on LinkedIn";
    readonly title: "LinkedIn";
    readonly href: "https://www.linkedin.com/company/hraness";
}, {
    readonly platform: "github";
    readonly label: "Hraness on GitHub";
    readonly title: "GitHub";
    readonly href: "https://github.com/hraness";
}];
export declare function parseHranessMailingListConfig(value: HranessMailingListConfig): HranessMailingListConfig;
export declare function parseHranessSocialConfig(value: HranessSocialConfig | undefined): HranessSocialConfig;
export declare function resolveHranessSocialLinks(value: HranessSocialConfig | undefined): ReadonlyArray<HranessSocialLink>;
/** Question-mark vector rendered inside the optional Accounts support link. */
export declare const HRANESS_SUPPORT_ICON_HTML: string;
export declare function resolveSupportLink(profile: SupportProfile | undefined): Readonly<{
    href: string;
    label: `Support ${string}: optional paid membership`;
    title: `${string} Review optional paid membership.`;
}> | null;
export declare function renderHranessSiteFooterInnerHtml(showBrand: boolean, mailingList: HranessMailingListConfig, state?: HranessMailingListRenderState, socialLinks?: ReadonlyArray<HranessSocialLink>, presentation?: FooterPresentation): string;
//# sourceMappingURL=internal.d.ts.map