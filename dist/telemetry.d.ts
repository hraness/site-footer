export declare const HRANESS_TELEMETRY_VISIT_URL = "https://account.hraness.com/api/telemetry/visit";
export declare function reportSiteVisit(): void;
/**
 * One aggregate experience summary per footer mount: bounded error digests
 * while the view lives, coarse Web Vitals ratings, and a dwell/scroll bucket
 * on exit. PerformanceObserver data never crosses the bucket boundary; the
 * view token is an ephemeral per-mount random and dies with the page.
 */
export declare function initSiteSignals(): void;
//# sourceMappingURL=telemetry.d.ts.map