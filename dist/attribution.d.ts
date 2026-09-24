import { type FooterViewport } from "./experiment.js";
export declare const FOOTER_STABLE_PROTOCOL = "stable-modal-v1";
export declare const FOOTER_COPY_PROTOCOL = "copy-modal-v1";
/** Accounts-assigned English signup labels; `direct` is the control. */
export declare const FOOTER_COPY_ARMS: readonly ["direct", "product", "newsletter"];
export type FooterCopyArm = (typeof FOOTER_COPY_ARMS)[number];
export declare function isFooterCopyArm(value: unknown): value is FooterCopyArm;
export interface FooterAttribution {
    readonly token: string;
    readonly expiresAt: number;
}
/** Fixed measurement contract; the response never determines presentation. */
export declare function requestStableFooterAttribution(audience: string, locale: string, viewport: FooterViewport, signal: AbortSignal): Promise<FooterAttribution | null>;
/** English copy test. The client echoes its rendered arm, and Accounts must confirm that same arm. */
export declare function requestCopyFooterAttribution(audience: string, locale: string, viewport: FooterViewport, arm: FooterCopyArm, signal: AbortSignal): Promise<FooterAttribution | null>;
//# sourceMappingURL=attribution.d.ts.map