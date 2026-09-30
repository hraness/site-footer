/** Browser enhancement for the same consent note rendered by React and static sites. */
export const HRANESS_CONSENT_REGION_URL = "https://account.hraness.com/api/consent/region";
export const HRANESS_CONSENT_STORAGE_KEY = "hraness-consent-cookies-v1";
export const HRANESS_CONSENT_SLOT = "hraness-cookie-consent";
export const HRANESS_CONSENT_ACCEPT_SLOT = "hraness-cookie-consent-accept";
export const HRANESS_CONSENT_DECLINE_SLOT = "hraness-cookie-consent-decline";

export type CookieConsentState = "checking" | "required" | "clear" | "declined";

type ConsentChoice = "accepted" | "declined" | null;
const pageChoices = new WeakMap<object, ConsentChoice>();

function choice(): ConsentChoice {
  if (pageChoices.has(window)) return pageChoices.get(window)!;
  try {
    const stored = window.localStorage.getItem(HRANESS_CONSENT_STORAGE_KEY);
    return stored === null ? null : stored === "accepted" ? "accepted" : "declined";
  } catch { return null; }
}

function rememberChoice(value: Exclude<ConsentChoice, null>): void {
  pageChoices.set(window, value);
  try { window.localStorage.setItem(HRANESS_CONSENT_STORAGE_KEY, value); }
  catch { /* The event preserves the choice for this page when storage is disabled. */ }
  window.dispatchEvent(new Event(`hraness-consent-${value}`));
}

/** Remember an explicit choice and notify analytics even when storage is unavailable. */
export function acceptCookieConsent(): void { rememberChoice("accepted"); }
export function declineCookieConsent(): void { rememberChoice("declined"); }

/** Observe regional notice visibility. A failed or unknown region requires a choice. */
export function observeCookieConsent(listener: (state: CookieConsentState) => void): () => void {
  const controller = new AbortController();
  let disposed = false;
  let currentChoice = choice();
  let regional: CookieConsentState = "checking";
  let timer: ReturnType<typeof setTimeout> | undefined;
  const publish = (): void => { if (!disposed) listener(currentChoice === "accepted" ? "clear" : currentChoice === "declined" ? "declined" : regional); };
  const onAccept = (): void => { pageChoices.set(window, "accepted"); currentChoice = "accepted"; publish(); };
  const onDecline = (): void => { pageChoices.set(window, "declined"); currentChoice = "declined"; publish(); };
  const onStorage = (event: StorageEvent): void => {
    if (event.key !== null && event.key !== HRANESS_CONSENT_STORAGE_KEY) return;
    pageChoices.delete(window);
    currentChoice = choice();
    if (currentChoice === null && regional === "checking") regional = "required";
    publish();
  };
  window.addEventListener("hraness-consent-accepted", onAccept);
  window.addEventListener("hraness-consent-declined", onDecline);
  window.addEventListener("storage", onStorage);
  publish();
  if (currentChoice === null) {
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
    window.removeEventListener("hraness-consent-declined", onDecline);
    window.removeEventListener("storage", onStorage);
  };
}

/** Keep the same preference controls available after either choice. */
export function updateCookieConsent(root: Document | HTMLElement, state: CookieConsentState): void {
  for (const note of root.querySelectorAll(`[data-slot="${HRANESS_CONSENT_SLOT}"]`)) {
    note.toggleAttribute("hidden", state === "checking");
    note.setAttribute("data-consent-state", state);
    const required = state === "required";
    note.querySelector('[data-consent-prompt]')?.toggleAttribute("hidden", !required);
    note.querySelector('[data-consent-icon]')?.toggleAttribute("hidden", !required);
    note.querySelector('[data-consent-label]')?.toggleAttribute("hidden", required);
    const summary = note.querySelector("summary");
    summary?.setAttribute("data-notice", required ? "required" : "preferences");
    summary?.setAttribute("aria-label", required ? "About cookies" : "Analytics preferences");
    summary?.setAttribute("title", required ? "About cookies" : "Analytics preferences");
  }
}

/** Shared by the static enhancer and the React adapter. */
export function chooseCookieConsent(target: Element): boolean {
  const button = target.closest(`[data-slot="${HRANESS_CONSENT_ACCEPT_SLOT}"], [data-slot="${HRANESS_CONSENT_DECLINE_SLOT}"]`);
  if (!button) return false;
  if (button.getAttribute("data-slot") === HRANESS_CONSENT_DECLINE_SLOT) declineCookieConsent();
  else acceptCookieConsent();
  const note = button.closest(`[data-slot="${HRANESS_CONSENT_SLOT}"]`);
  note?.querySelector("details")?.removeAttribute("open");
  (note?.querySelector("summary") as HTMLElement | null)?.focus?.();
  return true;
}

/** Activate package-rendered consent markup after inserting the static footer. */
export function initHranessCookieConsent(root: Document | HTMLElement = document): () => void {
  const removeConsent = observeCookieConsent(state => updateCookieConsent(root, state));
  const onClick = (event: Event): void => {
    const target = event.target as Element | null;
    if (typeof target?.closest !== "function" || !root.contains(target) || event.defaultPrevented) return;
    chooseCookieConsent(target);
  };
  root.addEventListener("click", onClick);
  return () => { removeConsent(); root.removeEventListener("click", onClick); };
}
