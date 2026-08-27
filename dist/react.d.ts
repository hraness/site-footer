export interface HranessSiteFooterProps {
    /** Omit the Hraness home link when the containing site already supplies that identity. */
    readonly showBrand?: boolean;
}
/** Server-renderable React adapter for the canonical static footer contract. */
export declare function HranessSiteFooter({ showBrand }?: HranessSiteFooterProps): import("react").DetailedReactHTMLElement<{
    "aria-label": string;
    className: string;
    "data-brand": string;
    "data-slot": string;
    dangerouslySetInnerHTML: {
        __html: string;
    };
}, HTMLElement>;
//# sourceMappingURL=react.d.ts.map