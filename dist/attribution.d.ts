import { type FooterViewport } from "./experiment.js";
/** Fixed measurement contract; the response never determines presentation. */
export declare function requestStableFooterAttribution(audience: string, locale: string, viewport: FooterViewport, signal: AbortSignal): Promise<{
    token: string;
    expiresAt: number;
} | null>;
//# sourceMappingURL=attribution.d.ts.map