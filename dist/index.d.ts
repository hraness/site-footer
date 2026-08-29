import { HRANESS_MAILING_SUBSCRIBE_URL, type HranessMailingListConfig, type HranessSocialLink, type HranessSocialPlatform } from "./internal.js";
export declare const HRANESS_HOME_URL = "https://hraness.com/";
export { HRANESS_MAILING_SUBSCRIBE_URL };
/** Canonical, immutable social-profile order shared by every Hraness website. */
export declare const hranessSocialLinks: ReadonlyArray<HranessSocialLink>;
export type { HranessMailingListConfig, HranessSocialLink, HranessSocialPlatform };
export interface HranessSiteFooterOptions {
    /** Explicitly select one mailing-list audience or omit mailing-list UI. */
    readonly mailingList: HranessMailingListConfig;
    /** Omit the Hraness home link when the containing site already supplies that identity. */
    readonly showBrand?: boolean;
}
/** Render the complete framework-neutral Hraness network footer. */
export declare function renderHranessSiteFooter({ mailingList: mailingListInput, showBrand, }: HranessSiteFooterOptions): string;
//# sourceMappingURL=index.d.ts.map