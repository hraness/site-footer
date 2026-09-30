// src/consent.ts
var HRANESS_CONSENT_REGION_URL = "https://account.hraness.com/api/consent/region";
var HRANESS_CONSENT_STORAGE_KEY = "hraness-consent-cookies-v1";
var HRANESS_CONSENT_SLOT = "hraness-cookie-consent";
var HRANESS_CONSENT_ACCEPT_SLOT = "hraness-cookie-consent-accept";
function accepted() {
  try {
    return window.localStorage.getItem(HRANESS_CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}
function acceptCookieConsent() {
  try {
    window.localStorage.setItem(HRANESS_CONSENT_STORAGE_KEY, "accepted");
  } catch {}
  window.dispatchEvent(new Event("hraness-consent-accepted"));
}
function observeCookieConsent(listener) {
  const controller = new AbortController;
  let disposed = false;
  let choiceAccepted = accepted();
  let regional = "checking";
  let timer;
  const publish = () => {
    if (!disposed)
      listener(choiceAccepted ? "clear" : regional);
  };
  const onAccept = () => {
    choiceAccepted = true;
    publish();
  };
  const onStorage = (event) => {
    if (event.key !== null && event.key !== HRANESS_CONSENT_STORAGE_KEY)
      return;
    choiceAccepted = accepted();
    if (!choiceAccepted && regional === "checking")
      regional = "required";
    publish();
  };
  window.addEventListener("hraness-consent-accepted", onAccept);
  window.addEventListener("storage", onStorage);
  publish();
  if (!choiceAccepted) {
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
    window.removeEventListener("storage", onStorage);
  };
}
function initHranessCookieConsent(root = document) {
  const removeConsent = observeCookieConsent((state) => {
    for (const note of root.querySelectorAll(`[data-slot="${HRANESS_CONSENT_SLOT}"]`)) {
      if (state === "required")
        note.removeAttribute("hidden");
      else
        note.setAttribute("hidden", "");
    }
  });
  const onClick = (event) => {
    const target = event.target;
    if (typeof target?.closest !== "function")
      return;
    const button = target.closest(`[data-slot="${HRANESS_CONSENT_ACCEPT_SLOT}"]`);
    if (button !== null && root.contains(button) && !event.defaultPrevented)
      acceptCookieConsent();
  };
  root.addEventListener("click", onClick);
  return () => {
    removeConsent();
    root.removeEventListener("click", onClick);
  };
}
export {
  observeCookieConsent,
  initHranessCookieConsent,
  acceptCookieConsent,
  HRANESS_CONSENT_STORAGE_KEY,
  HRANESS_CONSENT_SLOT,
  HRANESS_CONSENT_REGION_URL,
  HRANESS_CONSENT_ACCEPT_SLOT
};

//# debugId=64C07F20B70AC04364756E2164756E21
