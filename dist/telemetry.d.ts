export declare const HRANESS_TELEMETRY_VISIT_URL = "https://account.hraness.com/api/telemetry/visit";
/**
 * Reports one site visit per footer mount to the aggregate suite counter.
 * The payload is closed and identity-free: the local day token and the
 * referring hostname only — the server binds the visit to the product from
 * the request's real Origin. No page path, query, account, or IP-derived
 * signal is sent. Failures are ignored; telemetry must never affect the
 * host site.
 */
export declare function reportSiteVisit(): void;
//# sourceMappingURL=telemetry.d.ts.map