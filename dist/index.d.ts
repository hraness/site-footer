import { type HranessSocialLink, type HranessSocialPlatform } from "./internal.js";
export declare const HRANESS_HOME_URL = "https://hraness.com/";
export declare const HRANESS_NEWSLETTER_URL = "https://hraness.substack.com/subscribe";
/** Canonical, immutable social-profile order shared by every Hraness website. */
export declare const hranessSocialLinks: ReadonlyArray<HranessSocialLink>;
export type { HranessSocialLink, HranessSocialPlatform };
export interface HranessSiteFooterOptions {
    /** Omit the Hraness home link when the containing site already supplies that identity. */
    readonly showBrand?: boolean;
}
/** Render the complete framework-neutral Hraness network footer. */
export declare function renderHranessSiteFooter({ showBrand }?: HranessSiteFooterOptions): string;
//# sourceMappingURL=index.d.ts.map