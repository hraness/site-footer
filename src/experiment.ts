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

export const FOOTER_EXPERIMENT_URL = "https://account.hraness.com/api/mailing/experiment";
export const DEFAULT_FOOTER_VARIANT: FooterVariant = Object.freeze({
  layout: "inline", copyStyle: "direct", color: "green", shimmer: false,
});

export function parseFooterVariant(value: unknown): FooterVariant {
  if (!record(value) || (value.layout !== "inline" && value.layout !== "button")
    || (value.copyStyle !== "direct" && value.copyStyle !== "inviting")
    || (value.color !== "green" && value.color !== "orange" && value.color !== "blue")
    || typeof value.shimmer !== "boolean") throw new TypeError("Invalid Hraness footer experiment variant.");
  return { layout: value.layout, copyStyle: value.copyStyle, color: value.color, shimmer: value.shimmer };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseFooterEnrollment(value: unknown): FooterEnrollment | null {
  if (!record(value) || value.version !== 1 || typeof value.token !== "string"
    || !/^[0-9a-f]{64}$/u.test(value.token) || !record(value.assignment)) return null;
  const a = value.assignment;
  if (typeof a.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(a.id)
    || typeof a.locale !== "string" || !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,3}$/u.test(a.locale)
    || (a.layout !== "inline" && a.layout !== "button")
    || (a.copyStyle !== "direct" && a.copyStyle !== "inviting")
    || (a.color !== "green" && a.color !== "orange" && a.color !== "blue")
    || typeof a.shimmer !== "boolean"
    || (a.cohort !== "explore" && a.cohort !== "exploit")
    || typeof a.policyVersion !== "string" || !/^[A-Za-z0-9._-]{1,100}$/u.test(a.policyVersion)) return null;
  return { version: 1, token: value.token, assignment: {
    id: a.id, locale: a.locale, layout: a.layout, copyStyle: a.copyStyle,
    color: a.color, shimmer: a.shimmer, cohort: a.cohort, policyVersion: a.policyVersion,
  } };
}

/** Analytics requests are optional, credential-free, and never include the email address. */
export async function requestFooterEnrollment(
  audience: string, locale: string, signal: AbortSignal,
): Promise<FooterEnrollment | null> {
  try {
    const response = await fetch(FOOTER_EXPERIMENT_URL, {
      method: "POST", credentials: "omit", cache: "no-store", signal,
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ action: "assign", audience, locale }),
    });
    if (!response.ok) return null;
    return parseFooterEnrollment(await response.json());
  } catch { return null; }
}

export async function exposeFooterEnrollment(token: string, signal: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch(FOOTER_EXPERIMENT_URL, {
      method: "POST", credentials: "omit", cache: "no-store", signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "expose", token }),
    });
    return response.ok;
  } catch { return false; }
}
