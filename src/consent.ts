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
  return true;
}

/** Coordinate dismissal focus with the renderer that has actually applied the choice. */
export function createCookieConsentInteraction(root: Document | HTMLElement) {
  const document = root.nodeType === 9 ? root as Document : root.ownerDocument!;
  const view = document.defaultView;
  let outside: HTMLElement | null = null;
  let pending: { reopened: boolean; keyboard: boolean } | null = null;
  let frame: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  let restoreTabIndex: (() => void) | null = null;
  const consentSelector = `[data-slot="${HRANESS_CONSENT_SLOT}"]`;
  const visible = (element: HTMLElement | null): element is HTMLElement => {
    if (!element?.isConnected || !view || typeof view.getComputedStyle !== "function" || typeof element.getBoundingClientRect !== "function"
      || element.closest('[hidden], [inert], [aria-hidden="true"], [aria-disabled="true"]') || element.matches(":disabled")) return false;
    if (typeof element.checkVisibility === "function" && !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const css = view.getComputedStyle(element), box = element.getBoundingClientRect();
    return css.display !== "none" && css.visibility === "visible" && Number(css.opacity) !== 0
      && box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0
      && box.top < view.innerHeight && box.left < view.innerWidth;
  };
  const cancelPending = (): void => { pending = null; if (frame !== null) clearTimeout(frame); frame = null; };
  const isOutsideTarget = (element: HTMLElement): boolean => element !== document.body && element !== document.documentElement && !element.closest(consentSelector);
  const focus = (element: HTMLElement | null): boolean => {
    if (!visible(element)) return false;
    element.focus({ preventScroll: true });
    return document.activeElement === element;
  };
  const onFocus = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (typeof target?.closest !== "function") return;
    if (pending) cancelPending();
    if (isOutsideTarget(target)) {
      if (visible(target)) outside = target;
      // A real focus move after activation takes precedence over our restoration.
      cancelPending();
    }
  };
  const onPointer = (): void => { cancelPending(); };
  document.addEventListener("focusin", onFocus);
  document.addEventListener("pointerdown", onPointer, true);
  const initial = document.activeElement as HTMLElement | null;
  if (initial && isOutsideTarget(initial) && visible(initial)) outside = initial;

  const afterUpdate = (): void => {
    if (!pending || disposed || frame !== null) return;
    const note = root.querySelector(consentSelector);
    if (!note || note.getAttribute("data-consent-state") === "required" || note.hasAttribute("hidden")) return;
    // Static renderers update synchronously; React updates through an effect.
    // Defer layout inspection until that update, and query the current node again.
    frame = setTimeout(() => {
      frame = null;
      const request = pending;
      if (!request || disposed) return;
      pending = null;
      const currentNote = root.querySelector(consentSelector);
      const active = document.activeElement;
      if (active && active !== document.body && active !== document.documentElement && !currentNote?.contains(active)) return;
      const summary = currentNote?.querySelector<HTMLElement>("summary") ?? null;
      if ((request.reopened || request.keyboard) && focus(summary)) return;
      if (!request.keyboard) return;
      if (focus(outside)) return;
      const candidates = [...document.querySelectorAll<HTMLElement>('main, [role="main"], a[href], button, input, select, textarea, [tabindex]')]
        .filter(element => isOutsideTarget(element) && visible(element));
      for (const candidate of candidates) {
        restoreTabIndex?.();
        if (!candidate.hasAttribute("tabindex") && candidate.matches('main, [role="main"]')) {
          candidate.setAttribute("tabindex", "-1");
          const restore = (): void => {
            if (candidate.getAttribute("tabindex") === "-1") candidate.removeAttribute("tabindex");
            candidate.removeEventListener("blur", restore);
            if (restoreTabIndex === restore) restoreTabIndex = null;
          };
          restoreTabIndex = restore;
          candidate.addEventListener("blur", restore, { once: true });
        }
        if (focus(candidate)) return;
        restoreTabIndex?.();
      }
    }, 0);
  };
  return {
    choose(target: Element, keyboard: boolean): boolean {
      const button = target.closest(`[data-slot="${HRANESS_CONSENT_ACCEPT_SLOT}"], [data-slot="${HRANESS_CONSENT_DECLINE_SLOT}"]`);
      if (!button || !root.contains(button)) return false;
      const note = button.closest(consentSelector);
      cancelPending();
      pending = { reopened: note?.getAttribute("data-consent-state") !== "required", keyboard };
      const chosen = chooseCookieConsent(target);
      afterUpdate();
      return chosen;
    },
    afterUpdate,
    dispose(): void {
      disposed = true; cancelPending(); restoreTabIndex?.(); outside = null;
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("pointerdown", onPointer, true);
    },
  };
}

/** Activate package-rendered consent markup after inserting the static footer. */
export function initHranessCookieConsent(root: Document | HTMLElement = document): () => void {
  const interaction = createCookieConsentInteraction(root);
  const removeConsent = observeCookieConsent(state => { updateCookieConsent(root, state); interaction.afterUpdate(); });
  const onClick = (event: Event): void => {
    const target = event.target as Element | null;
    if (typeof target?.closest !== "function" || !root.contains(target) || event.defaultPrevented) return;
    interaction.choose(target, (event as MouseEvent).detail === 0);
  };
  root.addEventListener("click", onClick);
  return () => { removeConsent(); interaction.dispose(); root.removeEventListener("click", onClick); };
}
