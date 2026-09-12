/** The browser receives only bounded presentation values and an opaque enrollment capability. */
export interface FooterVariant {
    readonly layout: "inline" | "button";
    readonly copyStyle: "direct" | "inviting";
    readonly color: "green" | "orange" | "blue";
    readonly shimmer: boolean;
}
export interface FooterEnrollment {
    readonly version: 1;
    readonly token: string;
    readonly assignment: FooterVariant & {
        readonly id: string;
        readonly locale: string;
        readonly cohort: "explore" | "exploit";
        readonly policyVersion: string;
    };
}
export declare const FOOTER_EXPERIMENT_URL = "https://account.hraness.com/api/mailing/experiment";
export declare const DEFAULT_FOOTER_VARIANT: FooterVariant;
export declare function parseFooterVariant(value: unknown): FooterVariant;
export declare function parseFooterEnrollment(value: unknown): FooterEnrollment | null;
/** Analytics requests are optional, credential-free, and never include the email address. */
export declare function requestFooterEnrollment(audience: string, locale: string, signal: AbortSignal): Promise<FooterEnrollment | null>;
export declare function exposeFooterEnrollment(token: string, signal: AbortSignal): Promise<boolean>;
//# sourceMappingURL=experiment.d.ts.map