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
function telemetryAllowed(): boolean {
  if (
    typeof window === "undefined" || typeof fetch !== "function"
    || typeof window.location?.hostname !== "string"
    || typeof navigator === "undefined"
  ) return false;
  try {
    const browser = navigator as Navigator & {
      globalPrivacyControl?: boolean;
    };
    if (
      browser.webdriver === true || browser.doNotTrack === "1"
      || browser.globalPrivacyControl === true
    ) return false;
  } catch {
    return false;
  }
  return true;
}

function postSignal(payload: Record<string, unknown>): void {
  void fetch(HRANESS_TELEMETRY_VISIT_URL, {
    body: JSON.stringify(payload),
    credentials: "omit",
    headers: { "content-type": "application/json" },
    keepalive: true,
    method: "POST",
    mode: "cors",
  }).catch(() => {});
}

export function reportSiteVisit(): void {
  if (!telemetryAllowed()) return;
  const token = dailyVisitToken();
  if (token === null) return;
  const referrer = referrerHost();
  postSignal({
    ...(referrer === null ? {} : { referrer }),
    token,
    v: 1,
  });
}

/**
 * 16-hex FNV-1a digest of message+filename — the same client fault aggregates
 * into one series without ever transmitting message text or stack content.
 */
function errorDigest(message: string, source: string): string {
  let hash = 0x811c9dc5;
  const text = `${message}${source}`;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0") + "00000000".slice(8);
}

const DWELL_BUCKETS = [10_000, 60_000, 300_000] as const;
const VITAL_NAMES = ["lcp", "cls", "inp"] as const;
type VitalName = (typeof VITAL_NAMES)[number];
type VitalBucket = "good" | "needs-improvement" | "poor";

function vitalBucket(name: VitalName, value: number): VitalBucket {
  if (name === "lcp") return value <= 2_500 ? "good" : value <= 4_000 ? "needs-improvement" : "poor";
  if (name === "cls") return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
  return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
}

function dwellBucket(elapsed: number): string {
  return elapsed < DWELL_BUCKETS[0] ? "lt10s"
    : elapsed < DWELL_BUCKETS[1] ? "lt60s"
    : elapsed < DWELL_BUCKETS[2] ? "lt300s"
    : "gte300s";
}

function scrollBucket(): string {
  try {
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return "p100";
    const ratio = Math.min(1, Math.max(0, window.scrollY / total));
    return ratio >= 0.99 ? "p100"
      : ratio >= 0.75 ? "p75"
      : ratio >= 0.5 ? "p50"
      : ratio >= 0.25 ? "p25"
      : "p0";
  } catch {
    return "p0";
  }
}

/**
 * One aggregate experience summary per footer mount: bounded error digests
 * while the view lives, coarse Web Vitals ratings, and a dwell/scroll bucket
 * on exit. PerformanceObserver data never crosses the bucket boundary; the
 * view token is an ephemeral per-mount random and dies with the page.
 */
export function initSiteSignals(): void {
  if (!telemetryAllowed()) return;
  const token = dailyVisitToken();
  if (token === null) return;
  const view = crypto.randomUUID().replaceAll("-", "");
  const started = Date.now();

  const onFault = (message: string, source: string): void => {
    if (message.length === 0) return;
    postSignal({
      digest: errorDigest(message.slice(0, 240), source.slice(0, 120)),
      kind: "error",
      token,
      v: 1,
    });
  };
  window.addEventListener("error", event => {
    onFault(
      typeof event.message === "string" ? event.message : "",
      typeof event.filename === "string" ? event.filename : "",
    );
  }, true);
  window.addEventListener("unhandledrejection", event => {
    const reason = event.reason as unknown;
    onFault(
      reason instanceof Error ? reason.name : "",
      "",
    );
  });

  const vitals = new Map<VitalName, VitalBucket>();
  let clsValue = 0;
  try {
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last !== undefined) {
        vitals.set("lcp", vitalBucket("lcp", last.startTime));
      }
    }).observe({ buffered: true, type: "largest-contentful-paint" });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (shift.hadRecentInput !== true) clsValue += shift.value ?? 0;
      }
      vitals.set("cls", vitalBucket("cls", clsValue));
    }).observe({ buffered: true, type: "layout-shift" });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const timing = entry as PerformanceEntry & { duration: number };
        vitals.set("inp", vitalBucket("inp", timing.duration));
      }
    }).observe({
      buffered: true,
      durationThreshold: 40,
      type: "event",
    } as PerformanceObserverInit & { durationThreshold?: number });
  } catch {
    // Observers unsupported — vitals simply do not emit.
  }

  let sent = false;
  const finish = (): void => {
    if (sent || document.visibilityState !== "hidden") return;
    sent = true;
    if (vitals.size > 0) {
      postSignal({
        kind: "vitals",
        token,
        v: 1,
        ...(vitals.has("cls") ? { cls: vitals.get("cls") } : {}),
        ...(vitals.has("inp") ? { inp: vitals.get("inp") } : {}),
        ...(vitals.has("lcp") ? { lcp: vitals.get("lcp") } : {}),
      });
    }
    postSignal({
      dwell: dwellBucket(Date.now() - started),
      kind: "engage",
      scroll: scrollBucket(),
      token,
      v: 1,
      view,
    });
  };
  window.addEventListener("pagehide", finish);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") finish();
  });
}
