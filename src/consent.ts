/** Browser enhancement for the same consent note rendered by React and static sites. */
export const HRANESS_CONSENT_REGION_URL = "https://account.hraness.com/api/consent/region";
export const HRANESS_CONSENT_STORAGE_KEY = "hraness-consent-cookies-v1";
export const HRANESS_CONSENT_SLOT = "hraness-cookie-consent";
export const HRANESS_CONSENT_ACCEPT_SLOT = "hraness-cookie-consent-accept";

export type CookieConsentState = "checking" | "required" | "clear";

function accepted(): boolean {
  try { return window.localStorage.getItem(HRANESS_CONSENT_STORAGE_KEY) === "accepted"; }
  catch { return false; }
}

/** Remember an explicit choice and notify analytics even when storage is unavailable. */
export function acceptCookieConsent(): void {
  try { window.localStorage.setItem(HRANESS_CONSENT_STORAGE_KEY, "accepted"); }
  catch { /* The event preserves the choice for this page when storage is disabled. */ }
  window.dispatchEvent(new Event("hraness-consent-accepted"));
}

/** Observe regional notice visibility. A failed or unknown region requires a choice. */
export function observeCookieConsent(listener: (state: CookieConsentState) => void): () => void {
  const controller = new AbortController();
  let disposed = false;
  let choiceAccepted = accepted();
  let regional: CookieConsentState = "checking";
  let timer: ReturnType<typeof setTimeout> | undefined;
  const publish = (): void => { if (!disposed) listener(choiceAccepted ? "clear" : regional); };
  const onAccept = (): void => { choiceAccepted = true; publish(); };
  const onStorage = (event: StorageEvent): void => {
    if (event.key !== null && event.key !== HRANESS_CONSENT_STORAGE_KEY) return;
    choiceAccepted = accepted();
    if (!choiceAccepted && regional === "checking") regional = "required";
    publish();
  };
  window.addEventListener("hraness-consent-accepted", onAccept);
  window.addEventListener("storage", onStorage);
  publish();
  if (!choiceAccepted) {
    timer = setTimeout(() => { regional = "required"; publish(); controller.abort(); }, 5_000);
    void fetch(HRANESS_CONSENT_REGION_URL, {
      cache: "no-store", credentials: "omit", headers: { accept: "application/json" }, signal: controller.signal,
    }).then(async response => {
      const body: unknown = await response.json();
      if (controller.signal.aborted) return;
      regional = response.ok && typeof body === "object" && body !== null && !Array.isArray(body) && Reflect.get(body, "required") === false
        ? "clear" : "required";
      publish();
    }).catch(() => { if (!controller.signal.aborted) { regional = "required"; publish(); } })
      .finally(() => { clearTimeout(timer); });
  }
  return () => {
    disposed = true;
    clearTimeout(timer);
    controller.abort();
    window.removeEventListener("hraness-consent-accepted", onAccept);
    window.removeEventListener("storage", onStorage);
  };
}

/** Activate package-rendered consent markup after inserting the static footer. */
export function initHranessCookieConsent(root: Document | HTMLElement = document): () => void {
  const removeConsent = observeCookieConsent(state => {
    for (const note of root.querySelectorAll(`[data-slot="${HRANESS_CONSENT_SLOT}"]`)) {
      if (state === "required") note.removeAttribute("hidden");
      else note.setAttribute("hidden", "");
    }
  });
  const onClick = (event: Event): void => {
    const target = event.target as Element | null;
    if (typeof target?.closest !== "function") return;
    const button = target.closest(`[data-slot="${HRANESS_CONSENT_ACCEPT_SLOT}"]`);
    if (button !== null && root.contains(button) && !event.defaultPrevented) acceptCookieConsent();
  };
  root.addEventListener("click", onClick);
  return () => { removeConsent(); root.removeEventListener("click", onClick); };
}
