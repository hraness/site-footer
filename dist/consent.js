// src/consent.ts
var HRANESS_CONSENT_REGION_URL = "https://account.hraness.com/api/consent/region";
var HRANESS_CONSENT_STORAGE_KEY = "hraness-consent-cookies-v1";
var HRANESS_CONSENT_SLOT = "hraness-cookie-consent";
var HRANESS_CONSENT_ACCEPT_SLOT = "hraness-cookie-consent-accept";
var HRANESS_CONSENT_DECLINE_SLOT = "hraness-cookie-consent-decline";
var pageChoices = new WeakMap;
function choice() {
  if (pageChoices.has(window))
    return pageChoices.get(window);
  try {
    const stored = window.localStorage.getItem(HRANESS_CONSENT_STORAGE_KEY);
    return stored === null ? null : stored === "accepted" ? "accepted" : "declined";
  } catch {
    return null;
  }
}
function rememberChoice(value) {
  pageChoices.set(window, value);
  try {
    window.localStorage.setItem(HRANESS_CONSENT_STORAGE_KEY, value);
  } catch {}
  window.dispatchEvent(new Event(`hraness-consent-${value}`));
}
function acceptCookieConsent() {
  rememberChoice("accepted");
}
function declineCookieConsent() {
  rememberChoice("declined");
}
function observeCookieConsent(listener) {
  const controller = new AbortController;
  let disposed = false;
  let currentChoice = choice();
  let regional = "checking";
  let timer;
  const publish = () => {
    if (!disposed)
      listener(currentChoice === "accepted" ? "clear" : currentChoice === "declined" ? "declined" : regional);
  };
  const onAccept = () => {
    pageChoices.set(window, "accepted");
    currentChoice = "accepted";
    publish();
  };
  const onDecline = () => {
    pageChoices.set(window, "declined");
    currentChoice = "declined";
    publish();
  };
  const onStorage = (event) => {
    if (event.key !== null && event.key !== HRANESS_CONSENT_STORAGE_KEY)
      return;
    pageChoices.delete(window);
    currentChoice = choice();
    if (currentChoice === null && regional === "checking")
      regional = "required";
    publish();
  };
  window.addEventListener("hraness-consent-accepted", onAccept);
  window.addEventListener("hraness-consent-declined", onDecline);
  window.addEventListener("storage", onStorage);
  publish();
  if (currentChoice === null) {
    timer = setTimeout(() => {
      regional = "required";
      publish();
      controller.abort();
    }, 5000);
    fetch(HRANESS_CONSENT_REGION_URL, {
      cache: "no-store",
      credentials: "omit",
      headers: {
        accept: "application/json"
      },
      signal: controller.signal
    }).then(async (response) => {
      const body = await response.json();
      if (controller.signal.aborted)
        return;
      regional = response.ok && typeof body === "object" && body !== null && !Array.isArray(body) && Reflect.get(body, "required") === false ? "clear" : "required";
      publish();
    }).catch(() => {
      if (!controller.signal.aborted) {
        regional = "required";
        publish();
      }
    }).finally(() => {
      clearTimeout(timer);
    });
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
function updateCookieConsent(root, state) {
  for (const note of root.querySelectorAll(`[data-slot="${HRANESS_CONSENT_SLOT}"]`)) {
    note.toggleAttribute("hidden", state === "checking");
    note.setAttribute("data-consent-state", state);
    const required = state === "required";
    note.querySelector("[data-consent-prompt]")?.toggleAttribute("hidden", !required);
    note.querySelector("[data-consent-icon]")?.toggleAttribute("hidden", !required);
    note.querySelector("[data-consent-label]")?.toggleAttribute("hidden", required);
    const summary = note.querySelector("summary");
    summary?.setAttribute("data-notice", required ? "required" : "preferences");
    summary?.setAttribute("aria-label", required ? "About cookies" : "Analytics preferences");
    summary?.setAttribute("title", required ? "About cookies" : "Analytics preferences");
  }
}
function chooseCookieConsent(target) {
  const button = target.closest(`[data-slot="${HRANESS_CONSENT_ACCEPT_SLOT}"], [data-slot="${HRANESS_CONSENT_DECLINE_SLOT}"]`);
  if (!button)
    return false;
  if (button.getAttribute("data-slot") === HRANESS_CONSENT_DECLINE_SLOT)
    declineCookieConsent();
  else
    acceptCookieConsent();
  const note = button.closest(`[data-slot="${HRANESS_CONSENT_SLOT}"]`);
  note?.querySelector("details")?.removeAttribute("open");
  note?.querySelector("summary")?.focus?.();
  return true;
}
function initHranessCookieConsent(root = document) {
  const removeConsent = observeCookieConsent((state) => updateCookieConsent(root, state));
  const onClick = (event) => {
    const target = event.target;
    if (typeof target?.closest !== "function" || !root.contains(target) || event.defaultPrevented)
      return;
    chooseCookieConsent(target);
  };
  root.addEventListener("click", onClick);
  return () => {
    removeConsent();
    root.removeEventListener("click", onClick);
  };
}
export {
  updateCookieConsent,
  observeCookieConsent,
  initHranessCookieConsent,
  declineCookieConsent,
  chooseCookieConsent,
  acceptCookieConsent,
  HRANESS_CONSENT_STORAGE_KEY,
  HRANESS_CONSENT_SLOT,
  HRANESS_CONSENT_REGION_URL,
  HRANESS_CONSENT_DECLINE_SLOT,
  HRANESS_CONSENT_ACCEPT_SLOT
};

//# debugId=D8A0E98A889EFA2B64756E2164756E21
