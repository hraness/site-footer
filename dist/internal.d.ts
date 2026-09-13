import { type FooterVariant } from "./experiment.js";
import { type FooterLocale } from "./locales.js";
export interface FooterPresentation {
    readonly locale: FooterLocale;
    readonly variant: FooterVariant;
    readonly sticky: boolean;
}
export declare const DEFAULT_FOOTER_PRESENTATION: FooterPresentation;
export declare const HRANESS_FOOTER_LABEL = "Hraness network";
export declare const HRANESS_FOOTER_CLASS_NAME = "hraness-site-footer";
export declare const HRANESS_FOOTER_SLOT = "hraness-site-footer";
export declare const HRANESS_MAILING_FORM_SLOT = "hraness-mailing-list-signup";
export declare const HRANESS_MAILING_SOURCE = "hraness-site-footer";
export declare const HRANESS_MAILING_STATUS_SLOT = "hraness-mailing-list-status";
export declare const HRANESS_MAILING_SUBSCRIBE_URL = "https://account.hraness.com/api/mailing/subscribe";
export declare const HRANESS_MAILING_HONEYPOT_FIELD = "website";
export type HranessMailingListConfig = Readonly<{
    audience: string;
    kind: "signup";
}> | Readonly<{
    kind: "none";
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
export declare function renderHranessSiteFooterInnerHtml(showBrand: boolean, mailingList: HranessMailingListConfig, state?: HranessMailingListRenderState, socialLinks?: ReadonlyArray<HranessSocialLink>, presentation?: FooterPresentation): string;
//# sourceMappingURL=internal.d.ts.map