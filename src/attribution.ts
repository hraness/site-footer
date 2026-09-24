import { FOOTER_EXPERIMENT_URL, type FooterViewport } from "./experiment.js";

export const FOOTER_STABLE_PROTOCOL = "stable-modal-v1";
export const FOOTER_COPY_PROTOCOL = "copy-modal-v1";
/** Accounts-assigned English signup labels; `direct` is the control. */
export const FOOTER_COPY_ARMS = ["direct", "product", "newsletter"] as const;
export type FooterCopyArm = (typeof FOOTER_COPY_ARMS)[number];

export function isFooterCopyArm(value: unknown): value is FooterCopyArm {
  return typeof value === "string" && (FOOTER_COPY_ARMS as readonly string[]).includes(value);
}

export interface FooterAttribution { readonly token: string; readonly expiresAt: number }

/** Fixed measurement contract; the response never determines presentation. */
export async function requestStableFooterAttribution(audience: string, locale: string, viewport: FooterViewport, signal: AbortSignal): Promise<FooterAttribution | null> {
  const value = await requestAttribution({ action: "assign", audience, locale, viewport, presentationVersion: FOOTER_STABLE_PROTOCOL }, signal);
  return value && fixedAssignment(value, { locale, viewport, copyStyle: "direct", cohort: "fixed", policyVersion: FOOTER_STABLE_PROTOCOL })
    ? { token: value.token, expiresAt: value.expiresAt } : null;
}

/** English copy test. The client echoes its rendered arm, and Accounts must confirm that same arm. */
export async function requestCopyFooterAttribution(audience: string, locale: string, viewport: FooterViewport, arm: FooterCopyArm, signal: AbortSignal): Promise<FooterAttribution | null> {
  const value = await requestAttribution({ action: "assign", audience, locale, viewport, presentationVersion: FOOTER_COPY_PROTOCOL, copyArm: arm }, signal);
  return value && fixedAssignment(value, { locale, viewport, copyStyle: arm, cohort: "explore", policyVersion: FOOTER_COPY_PROTOCOL })
    ? { token: value.token, expiresAt: value.expiresAt } : null;
}

type Envelope = FooterAttribution & { readonly assignment: object };

function fixedAssignment(value: Envelope, expected: Record<string, string>): boolean {
  const id = Reflect.get(value.assignment, "id");
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(id)) return false;
  for (const [key, want] of Object.entries({ ...expected, layout: "button", color: "green", shimmer: false })) {
    if (Reflect.get(value.assignment, key) !== want) return false;
  }
  return true;
}

async function requestAttribution(body: Record<string, string>, signal: AbortSignal): Promise<Envelope | null> {
  try {
    const response = await fetch(FOOTER_EXPERIMENT_URL, {
      method: "POST", credentials: "omit", cache: "no-store", signal,
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    if (!response.body) return null;
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let bytes = 0;
    let text = "";
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 2_048 || signal.aborted) { await reader.cancel(); return null; }
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
    } finally { reader.releaseLock(); }
    const value: unknown = JSON.parse(text);
    if (typeof value !== "object" || value === null) return null;
    const token = Reflect.get(value, "token");
    const expiresAt: unknown = Reflect.get(value, "expiresAt");
    if (typeof expiresAt !== "number" || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() + 60_000 || expiresAt > Date.now() + 48 * 60 * 60 * 1_000 + 60_000) return null;
    const assignment: unknown = Reflect.get(value, "assignment");
    if (Reflect.get(value, "version") !== 1 || typeof token !== "string" || !/^[0-9a-f]{64}$/u.test(token)
      || typeof assignment !== "object" || assignment === null) return null;
    return signal.aborted ? null : { token, expiresAt, assignment };
  } catch { return null; }
}
