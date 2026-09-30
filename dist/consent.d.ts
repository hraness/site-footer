/** Browser enhancement for the same consent note rendered by React and static sites. */
export declare const HRANESS_CONSENT_REGION_URL = "https://account.hraness.com/api/consent/region";
export declare const HRANESS_CONSENT_STORAGE_KEY = "hraness-consent-cookies-v1";
export declare const HRANESS_CONSENT_SLOT = "hraness-cookie-consent";
export declare const HRANESS_CONSENT_ACCEPT_SLOT = "hraness-cookie-consent-accept";
export type CookieConsentState = "checking" | "required" | "clear";
/** Remember an explicit choice and notify analytics even when storage is unavailable. */
export declare function acceptCookieConsent(): void;
/** Observe regional notice visibility. A failed or unknown region requires a choice. */
export declare function observeCookieConsent(listener: (state: CookieConsentState) => void): () => void;
/** Activate package-rendered consent markup after inserting the static footer. */
export declare function initHranessCookieConsent(root?: Document | HTMLElement): () => void;
//# sourceMappingURL=consent.d.ts.map