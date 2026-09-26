export const HRANESS_TELEMETRY_VISIT_URL =
  "https://account.hraness.com/api/telemetry/visit";

const VISIT_TOKEN_KEY = "hraness-site-visit";
const DAY_TOKEN_PATTERN = /^[a-f0-9]{16,64}$/u;
const HOST_PATTERN = /^[a-z0-9.-]{1,253}$/u;

/**
 * Cookieless per-day visitor token minted in localStorage and rotated at UTC
 * midnight. It never links across days or products and carries no account or
 * session identity; it exists only so daily unique counts are meaningful.
 */
function dailyVisitToken(): string | null {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const stored = window.localStorage.getItem(VISIT_TOKEN_KEY);
    if (stored !== null) {
      const separator = stored.indexOf(":");
      const token = stored.slice(separator + 1);
      if (
        separator > 0 && stored.slice(0, separator) === day
        && DAY_TOKEN_PATTERN.test(token)
      ) {
        return token;
      }
    }
    const token = crypto.randomUUID().replaceAll("-", "");
    window.localStorage.setItem(VISIT_TOKEN_KEY, `${day}:${token}`);
    return token;
  } catch {
    return null;
  }
}

function referrerHost(): string | null {
  try {
    if (
      typeof document?.referrer !== "string" || document.referrer.length === 0
    ) return null;
    const host = new URL(document.referrer).hostname.toLowerCase();
    if (host === window.location.hostname.toLowerCase()) return null;
    return HOST_PATTERN.test(host) ? host : null;
  } catch {
    return null;
  }
}

/**
 * Reports one site visit per footer mount to the aggregate suite counter.
 * The payload is closed and identity-free: the local day token and the
 * referring hostname only — the server binds the visit to the product from
 * the request's real Origin. No page path, query, account, or IP-derived
 * signal is sent. Failures are ignored; telemetry must never affect the
 * host site.
 */
export function reportSiteVisit(): void {
  if (
    typeof window === "undefined" || typeof fetch !== "function"
    || typeof window.location?.hostname !== "string"
    || typeof navigator === "undefined"
  ) return;
  try {
    const browser = navigator as Navigator & {
      globalPrivacyControl?: boolean;
    };
    if (
      browser.webdriver === true || browser.doNotTrack === "1"
      || browser.globalPrivacyControl === true
    ) return;
  } catch {
    return;
  }
  const token = dailyVisitToken();
  if (token === null) return;
  const referrer = referrerHost();
  void fetch(HRANESS_TELEMETRY_VISIT_URL, {
    body: JSON.stringify({
      ...(referrer === null ? {} : { referrer }),
      token,
      v: 1,
    }),
    credentials: "omit",
    headers: { "content-type": "application/json" },
    keepalive: true,
    method: "POST",
    mode: "cors",
  }).catch(() => {});
}
