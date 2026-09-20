import { FOOTER_EXPERIMENT_URL, type FooterViewport } from "./experiment.js";

/** Fixed measurement contract; the response never determines presentation. */
export async function requestStableFooterAttribution(audience: string, locale: string, viewport: FooterViewport, signal: AbortSignal): Promise<{ token: string; expiresAt: number } | null> {
  try {
    const response = await fetch(FOOTER_EXPERIMENT_URL, {
      method: "POST", credentials: "omit", cache: "no-store", signal,
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ action: "assign", audience, locale, viewport, presentationVersion: "stable-modal-v1" }),
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
    const id = Reflect.get(assignment, "id");
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(id)) return null;
    for (const [key, expected] of Object.entries({ locale, viewport, layout: "button", copyStyle: "direct", color: "green", shimmer: false, cohort: "fixed", policyVersion: "stable-modal-v1" })) {
      if (Reflect.get(assignment, key) !== expected) return null;
    }
    return signal.aborted ? null : { token, expiresAt };
  } catch { return null; }
}
