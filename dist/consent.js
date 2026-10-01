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
  return true;
}
function createCookieConsentInteraction(root) {
  const document2 = root.nodeType === 9 ? root : root.ownerDocument;
  const view = document2.defaultView;
  let outside = null;
  let pending = null;
  let frame = null;
  let disposed = false;
  let restoreTabIndex = null;
  const consentSelector = `[data-slot="${HRANESS_CONSENT_SLOT}"]`;
  const visible = (element) => {
    if (!element?.isConnected || !view || typeof view.getComputedStyle !== "function" || typeof element.getBoundingClientRect !== "function" || element.closest('[hidden], [inert], [aria-hidden="true"], [aria-disabled="true"]') || element.matches(":disabled"))
      return false;
    if (typeof element.checkVisibility === "function" && !element.checkVisibility({
      checkOpacity: true,
      checkVisibilityCSS: true
    }))
      return false;
    const css = view.getComputedStyle(element), box = element.getBoundingClientRect();
    return css.display !== "none" && css.visibility === "visible" && Number(css.opacity) !== 0 && box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0 && box.top < view.innerHeight && box.left < view.innerWidth;
  };
  const cancelPending = () => {
    pending = null;
    if (frame !== null)
      clearTimeout(frame);
    frame = null;
  };
  const isOutsideTarget = (element) => element !== document2.body && element !== document2.documentElement && !element.closest(consentSelector);
  const focus = (element) => {
    if (!visible(element))
      return false;
    element.focus({
      preventScroll: true
    });
    return document2.activeElement === element;
  };
  const onFocus = (event) => {
    const target = event.target;
    if (typeof target?.closest !== "function")
      return;
    if (pending)
      cancelPending();
    if (isOutsideTarget(target)) {
      if (visible(target))
        outside = target;
      cancelPending();
    }
  };
  const onPointer = () => {
    cancelPending();
  };
  document2.addEventListener("focusin", onFocus);
  document2.addEventListener("pointerdown", onPointer, true);
  const initial = document2.activeElement;
  if (initial && isOutsideTarget(initial) && visible(initial))
    outside = initial;
  const afterUpdate = () => {
    if (!pending || disposed || frame !== null)
      return;
    const note = root.querySelector(consentSelector);
    if (!note || note.getAttribute("data-consent-state") === "required" || note.hasAttribute("hidden"))
      return;
    frame = setTimeout(() => {
      frame = null;
      const request = pending;
      if (!request || disposed)
        return;
      pending = null;
      const currentNote = root.querySelector(consentSelector);
      const active = document2.activeElement;
      if (active && active !== document2.body && active !== document2.documentElement && !currentNote?.contains(active))
        return;
      const summary = currentNote?.querySelector("summary") ?? null;
      if ((request.reopened || request.keyboard) && focus(summary))
        return;
      if (!request.keyboard)
        return;
      if (focus(outside))
        return;
      const candidates = [...document2.querySelectorAll('main, [role="main"], a[href], button, input, select, textarea, [tabindex]')].filter((element) => isOutsideTarget(element) && visible(element));
      for (const candidate of candidates) {
        restoreTabIndex?.();
        if (!candidate.hasAttribute("tabindex") && candidate.matches('main, [role="main"]')) {
          candidate.setAttribute("tabindex", "-1");
          const restore = () => {
            if (candidate.getAttribute("tabindex") === "-1")
              candidate.removeAttribute("tabindex");
            candidate.removeEventListener("blur", restore);
            if (restoreTabIndex === restore)
              restoreTabIndex = null;
          };
          restoreTabIndex = restore;
          candidate.addEventListener("blur", restore, {
            once: true
          });
        }
        if (focus(candidate))
          return;
        restoreTabIndex?.();
      }
    }, 0);
  };
  return {
    choose(target, keyboard) {
      const button = target.closest(`[data-slot="${HRANESS_CONSENT_ACCEPT_SLOT}"], [data-slot="${HRANESS_CONSENT_DECLINE_SLOT}"]`);
      if (!button || !root.contains(button))
        return false;
      const note = button.closest(consentSelector);
      cancelPending();
      pending = {
        reopened: note?.getAttribute("data-consent-state") !== "required",
        keyboard
      };
      const chosen = chooseCookieConsent(target);
      afterUpdate();
      return chosen;
    },
    afterUpdate,
    dispose() {
      disposed = true;
      cancelPending();
      restoreTabIndex?.();
      outside = null;
      document2.removeEventListener("focusin", onFocus);
      document2.removeEventListener("pointerdown", onPointer, true);
    }
  };
}
function initHranessCookieConsent(root = document) {
  const interaction = createCookieConsentInteraction(root);
  const removeConsent = observeCookieConsent((state) => {
    updateCookieConsent(root, state);
    interaction.afterUpdate();
  });
  const onClick = (event) => {
    const target = event.target;
    if (typeof target?.closest !== "function" || !root.contains(target) || event.defaultPrevented)
      return;
    interaction.choose(target, event.detail === 0);
  };
  root.addEventListener("click", onClick);
  return () => {
    removeConsent();
    interaction.dispose();
    root.removeEventListener("click", onClick);
  };
}
export {
  updateCookieConsent,
  observeCookieConsent,
  initHranessCookieConsent,
  declineCookieConsent,
  createCookieConsentInteraction,
  chooseCookieConsent,
  acceptCookieConsent,
  HRANESS_CONSENT_STORAGE_KEY,
  HRANESS_CONSENT_SLOT,
  HRANESS_CONSENT_REGION_URL,
  HRANESS_CONSENT_DECLINE_SLOT,
  HRANESS_CONSENT_ACCEPT_SLOT
};

//# debugId=52E7557DCD25837864756E2164756E21
