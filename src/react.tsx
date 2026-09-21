"use client";
import type { SupportProfile } from "./internal.js";

import { attachFooterFoil } from "./foil.js";
import { footerClassName, footerClasses, footerInnerClassName, mailingStatusClassName } from "./footer.stylex.js";
import { resolveFooterLocale, stableFooterMessages } from "./locales.js";
import { requestStableFooterAttribution } from "./attribution.js";
import { DEFAULT_FOOTER_VARIANT, FOOTER_WIDE_QUERY, exposeFooterEnrollment } from "./experiment.js";
import type { HranessFooterConversionEvent, HranessFooterConversionStage, HranessFooterConversionReason } from "./internal.js";
export type { HranessFooterConversionEvent, HranessFooterConversionStage, HranessFooterConversionReason } from "./internal.js";

import {
  HRANESS_CONSENT_ACCEPT_SLOT,
  HRANESS_CONSENT_REGION_URL,
  HRANESS_CONSENT_SLOT,
  HRANESS_CONSENT_STORAGE_KEY,
  HRANESS_FOOTER_LABEL,
  HRANESS_FOOTER_SLOT,
  HRANESS_MAILING_FORM_SLOT,
  HRANESS_MAILING_SOURCE,
  HRANESS_MAILING_STATUS_SLOT,
  HRANESS_MAILING_SUBSCRIBE_URL,
  HRANESS_SUPPORT_ICON_HTML,
  parseHranessMailingListConfig,
  renderHranessSiteFooterInnerHtml,
  resolveHranessSocialLinks,
  resolveSupportLink,
  type HranessMailingListConfig,
  type HranessMailingListRenderState,
  type HranessSocialConfig,
} from "./internal.js";
import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

export interface HranessSiteFooterProps {
  /** Explicit Accounts product identity. Omit to render no paid-support control. */
  readonly support?: SupportProfile;
  /** Localize signup and account controls; defaults to browser language preferences after hydration. */
  readonly locale?: string | readonly string[];
  /** @deprecated Retained for source compatibility; never changes UI or requests assignments. */
  readonly experiment?: boolean;
  /** Optional, privacy-bounded observations. Omit when attribution is ineligible. */
  readonly onConversion?: ((event: HranessFooterConversionEvent) => void) | undefined;
  /** Opt in only while measurement is eligible; fixed token attribution never controls presentation. */
  readonly attribution?: boolean;
  /** Sticky includes its own document footprint. Flow leaves placement to the host. */
  readonly placement?: "sticky" | "flow";
  /** Select signup, the signed-in account link, or no account/signup control. */
  readonly mailingList: HranessMailingListConfig;
  /** Omit the Hraness home link when the containing site already supplies that identity. */
  readonly showBrand?: boolean;
  /**
   * Retarget owned social destinations without adding platforms or changing
   * order. Defaults remain the shared Hraness profiles.
   */
  readonly social?: HranessSocialConfig;
}

const IDLE_STATE = { kind: "idle" } as const satisfies HranessMailingListRenderState;

function activeStateFor(
  mailingList: HranessMailingListConfig,
  state: HranessMailingListRenderState,
): HranessMailingListRenderState {
  if (mailingList.kind !== "signup" || state.kind === "idle") return IDLE_STATE;
  return state.audience === mailingList.audience ? state : IDLE_STATE;
}

/** Progressively enhance the canonical native mailing-list form when JavaScript is available. */
export function HranessSiteFooter({
  locale: localeInput,
  onConversion,
  attribution = false,
  placement = "sticky",
  mailingList: mailingListInput,
  showBrand = true,
  social: socialInput,
  support,
}: HranessSiteFooterProps) {
  const mailingList = parseHranessMailingListConfig(mailingListInput);
  const supportLink = resolveSupportLink(support);
  const mailingListKey = mailingList.kind === "signup" ? `signup:${mailingList.audience}` : mailingList.kind;
  const socialLinks = resolveHranessSocialLinks(socialInput);
  const [state, setState] = useState<HranessMailingListRenderState>(IDLE_STATE);
  const [consentPending, setConsentPending] = useState(false);
  const [locale, setLocale] = useState(() => resolveFooterLocale(localeInput));
  const activeRequest = useRef<AbortController | null>(null);
  const attributionContext = useRef({ key: mailingListKey, enabled: attribution, locale: locale.locale });
  const attributionRequest = useRef<AbortController | null>(null);
  const exposureRequest = useRef<AbortController | null>(null);
  const markAttribution = useRef<() => string | null>(() => null);
  const attributionCache = useRef<{ scope: string; token: string; expiresAt: number; exposed: boolean } | null>(null);
  const footer = useRef<HTMLElement | null>(null);
  const mounted = useRef(false);
  const activeKey = useRef(mailingListKey);
  const observerState = useRef({ callback: onConversion, key: mailingListKey, epoch: 0 });
  const impressionSent = useRef(false);
  const inputStarted = useRef(false);
  const interacted = useRef(false);
  const draft = useRef("");
  const modalOpen = useRef(false);
  const closeModal = useRef<(reason: HranessFooterConversionReason) => void>(() => {});
  const openModal = useRef<() => void>(() => {});
  const variant = DEFAULT_FOOTER_VARIANT;
  const socialKey = socialLinks.map((link) => `${link.platform}:${link.href}:${link.label}`).join("|");
  const renderState = activeStateFor(mailingList, state);
  const presentationKey = `${locale.locale}:${placement}`;

  useLayoutEffect(() => {
    const context = attributionContext.current;
    if (context.key !== mailingListKey || context.enabled !== attribution || context.locale !== locale.locale) {
      attributionRequest.current?.abort();
      exposureRequest.current?.abort();
      markAttribution.current = () => null;
      attributionContext.current = { key: mailingListKey, enabled: attribution, locale: locale.locale };
      const token = footer.current?.querySelector<HTMLInputElement>('input[name="experimentToken"]');
      if (token) { token.value = ""; token.disabled = true; }
    }
    const previous = observerState.current;
    if (Boolean(previous.callback) !== Boolean(onConversion) || previous.key !== mailingListKey) previous.epoch++;
    previous.callback = onConversion;
    previous.key = mailingListKey;
    if (activeKey.current !== mailingListKey) {
      activeRequest.current?.abort();
      activeRequest.current = null;
      activeKey.current = mailingListKey;
      attributionCache.current = null;
      impressionSent.current = false;
      inputStarted.current = false;
      interacted.current = false;
      draft.current = "";
      modalOpen.current = false;
      setState(IDLE_STATE);
    }
  });
  useLayoutEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; activeRequest.current?.abort(); attributionRequest.current?.abort(); exposureRequest.current?.abort(); markAttribution.current = () => null; };
  }, []);
  useEffect(() => {
    if (!interacted.current) setLocale(resolveFooterLocale(localeInput ?? navigator.languages));
  }, [typeof localeInput === "string" ? localeInput : localeInput?.join(",")]);

  const emit = useCallback((stage: HranessFooterConversionStage, reason?: HranessFooterConversionReason): boolean => {
    const observer = observerState.current;
    if (!mounted.current || mailingList.kind !== "signup" || observer.key !== mailingListKey || !observer.callback) return false;
    try {
      observer.callback(Object.freeze({ stage, presentationVersion: "stable-modal-v1", audience: mailingList.audience,
        locale: locale.locale, ...(reason === undefined ? {} : { reason }) }));
    } catch { /* Observers cannot change the form or request outcome. */ }
    return true;
  }, [mailingListKey, locale.locale]);

  const handleSubmit = useCallback((event: FormEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.tagName !== "FORM" || target.dataset.slot !== HRANESS_MAILING_FORM_SLOT
      || !mounted.current || mailingList.kind !== "signup" || activeKey.current !== mailingListKey
      || typeof fetch !== "function" || typeof FormData !== "function" || typeof AbortController !== "function") return;
    const emailControl = target.querySelector<HTMLInputElement>('input[name="email"]');
    if (!emailControl) return;
    event.preventDefault();
    if (activeRequest.current !== null || renderState.kind === "pending" || renderState.kind === "accepted") return;
    // Native submission validates first. Explicitly dispatched submits also fail closed.
    if (typeof emailControl.reportValidity === "function" && !emailControl.reportValidity()) return;
    const email = emailControl.value;
    draft.current = email;
    const body = new FormData();
    body.set("audience", mailingList.audience);
    body.set("email", email);
    body.set("source", HRANESS_MAILING_SOURCE);
    body.set("website", target.querySelector<HTMLInputElement>('input[name="website"]')?.value ?? "");
    const token = markAttribution.current();
    if (token) body.set("experimentToken", token);
    const request = new AbortController();
    const requestKey = mailingListKey;
    const requestEpoch = observerState.current.epoch;
    activeRequest.current = request;
    const attributed = emit("submit");
    setState({ audience: mailingList.audience, email, kind: "pending" });
    const reportResult = (stage: "accepted" | "error", reason?: HranessFooterConversionReason) => {
      if (attributed && observerState.current.epoch === requestEpoch) emit(stage, reason);
    };
    void fetch(HRANESS_MAILING_SUBSCRIBE_URL, {
      body, credentials: "omit", headers: { accept: "application/json" }, method: "POST", signal: request.signal,
    }).then((response) => {
      if (request.signal.aborted || activeRequest.current !== request || activeKey.current !== requestKey) return;
      activeRequest.current = null;
      setState(response.ok ? { audience: mailingList.audience, kind: "accepted" } : { audience: mailingList.audience, email, kind: "error" });
      reportResult(response.ok ? "accepted" : "error", response.ok ? undefined : "request_failed");
    }).catch(() => {
      if (activeRequest.current !== request || request.signal.aborted || activeKey.current !== requestKey) return;
      activeRequest.current = null;
      setState({ audience: mailingList.audience, email, kind: "error" });
      reportResult("error", "network_error");
    });
  }, [mailingListKey, renderState.kind, emit]);

  const innerHtml = useMemo(
    () => renderHranessSiteFooterInnerHtml(
      showBrand,
      mailingList,
      IDLE_STATE,
      socialLinks,
      { locale, variant, sticky: placement === "sticky", ...(support === undefined ? {} : { support }) },
    ),
    // Support-only updates patch their own link below, preserving an active
    // native form, disclosure, focus, and in-flight request.
    [mailingListKey, showBrand, socialKey, presentationKey],
  );
  const innerHtmlProp = useMemo(() => ({ __html: innerHtml }), [innerHtml]);

  useEffect(() => {
    if (!attribution || mailingList.kind !== "signup") return;
    const context = attributionContext.current;
    const query = typeof window.matchMedia === "function" ? window.matchMedia(FOOTER_WIDE_QUERY) : null;
    const input = footer.current?.querySelector<HTMLInputElement>('input[name="experimentToken"]');
    const trigger = footer.current?.querySelector('[data-slot="hraness-mailing-disclosure"] > summary');
    let token: string | null = null;
    let exposed = false;
    let visible = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let expiry: ReturnType<typeof setTimeout> | undefined;
    let dwell: ReturnType<typeof setTimeout> | undefined;
    const valid = () => mounted.current && attributionContext.current === context && context.enabled;
    const viewport = () => query?.matches === false ? "compact" as const : "wide" as const;
    let assignedViewport = viewport();
    const scope = () => `${window.location?.origin ?? ""}:${mailingListKey}:${locale.locale}:${viewport()}`;
    const mark = () => {
      if (!valid() || !token || assignedViewport !== viewport() || !attributionCache.current || attributionCache.current.expiresAt <= Date.now() + 60_000) return null;
      if (!exposed) {
        exposed = true;
        const controller = new AbortController();
        exposureRequest.current = controller;
        const cached = attributionCache.current;
        void exposeFooterEnrollment(token, controller.signal).then(accepted => {
          if (accepted && !controller.signal.aborted) cached.exposed = true;
          else if (valid()) exposed = false;
        });
      }
      return token;
    };
    const update = () => {
      if (dwell !== undefined) clearTimeout(dwell);
      if (visible && document.visibilityState === "visible" && !exposed && token) dwell = setTimeout(mark, 400);
    };
    const assign = () => {
      attributionRequest.current?.abort(); exposureRequest.current?.abort();
      if (timeout !== undefined) clearTimeout(timeout);
      if (expiry !== undefined) clearTimeout(expiry);
      if (dwell !== undefined) clearTimeout(dwell);
      token = null; exposed = false;
      if (input) { input.disabled = true; input.value = ""; }
      if (!valid()) return;
      assignedViewport = viewport();
      const install = (cached: NonNullable<typeof attributionCache.current>) => {
        token = cached.token; exposed = cached.exposed;
        if (input) { input.value = token; input.disabled = false; }
        expiry = setTimeout(assign, Math.max(0, cached.expiresAt - Date.now() - 60_000));
        update();
      };
      const cached = attributionCache.current;
      if (cached?.scope === scope() && cached.expiresAt > Date.now() + 60_000) { install(cached); return; }
      attributionCache.current = null;
      const controller = new AbortController();
      attributionRequest.current = controller;
      timeout = setTimeout(() => controller.abort(), 1_500);
      void requestStableFooterAttribution(mailingList.audience, locale.locale, assignedViewport, controller.signal).then(result => {
        if (!valid() || controller.signal.aborted || attributionRequest.current !== controller) return;
        if (timeout !== undefined) clearTimeout(timeout);
        if (result) {
          const cached = { ...result, scope: scope(), exposed: false };
          attributionCache.current = cached;
          install(cached);
        }
      });
    };
    markAttribution.current = mark;
    const observer = typeof IntersectionObserver === "function" && trigger ? new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5); update();
    }, { threshold: 0.5 }) : null;
    if (observer && trigger) observer.observe(trigger);
    document.addEventListener("visibilitychange", update);
    query?.addEventListener("change", assign);
    assign();
    return () => {
      attributionRequest.current?.abort(); exposureRequest.current?.abort();
      if (timeout !== undefined) clearTimeout(timeout);
      if (dwell !== undefined) clearTimeout(dwell);
      if (expiry !== undefined) clearTimeout(expiry);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
      query?.removeEventListener("change", assign);
      if (markAttribution.current === mark) markAttribution.current = () => null;
      if (input) { input.value = ""; input.disabled = true; }
    };
  }, [attribution, mailingListKey, locale.locale, innerHtml]);

  // Upgrade the same native disclosure and form; callbacks and request states
  // never replace this DOM, so input, focus and the top-layer dialog survive.
  useLayoutEffect(() => {
    const disclosure = footer.current?.querySelector<HTMLDetailsElement>('[data-slot="hraness-mailing-disclosure"]');
    const dialog = footer.current?.querySelector<HTMLDialogElement>('[data-slot="hraness-mailing-dialog"]');
    const trigger = disclosure?.querySelector<HTMLElement>("summary");
    if (!disclosure || !dialog || !trigger) return;
    const input = dialog.querySelector<HTMLInputElement>('input[name="email"]');
    if (input) input.value = draft.current;
    const native = typeof dialog.showModal === "function" && typeof dialog.close === "function";
    const root = dialog.ownerDocument.documentElement;
    let previousOverflow: string | null = null;
    let previousPriority = "";
    const unlock = () => {
      if (previousOverflow === null) return;
      if (root.style.getPropertyValue("overflow") === "hidden") {
        if (previousOverflow) root.style.setProperty("overflow", previousOverflow, previousPriority);
        else root.style.removeProperty("overflow");
      }
      previousOverflow = null;
    };
    const viewport = () => {
      const visual = window.visualViewport;
      const height = Math.max(1, visual?.height ?? window.innerHeight);
      const top = Math.max(0, visual?.offsetTop ?? 0);
      if (Number.isFinite(height)) dialog.style.setProperty("--hraness-signup-viewport-height", `${height}px`);
      if (Number.isFinite(top)) dialog.style.setProperty("--hraness-signup-viewport-top", `${top}px`);
    };
    const dismiss = (reason: HranessFooterConversionReason) => {
      if (!modalOpen.current) return;
      modalOpen.current = false;
      if (native && dialog.open) dialog.close();
      disclosure.open = false;
      trigger.setAttribute("aria-expanded", "false");
      unlock();
      trigger.focus({ preventScroll: true });
      emit("close", reason);
    };
    const reveal = (report = true) => {
      if (modalOpen.current && report) return;
      interacted.current = true;
      disclosure.open = true;
      viewport();
      if (native && !dialog.open) dialog.showModal();
      modalOpen.current = true;
      trigger.setAttribute("aria-expanded", "true");
      if (native && previousOverflow === null) {
        previousOverflow = root.style.getPropertyValue("overflow");
        previousPriority = root.style.getPropertyPriority("overflow");
        root.style.setProperty("overflow", "hidden");
      }
      // Must run inside trusted activation, before awaiting anything, for touch keyboards.
      const target = dialog.querySelector<HTMLElement>('form:not([hidden]) input[name="email"]')
        ?? dialog.querySelector<HTMLElement>(`[data-slot="${HRANESS_MAILING_STATUS_SLOT}"]`);
      target?.focus({ preventScroll: true });
      if (report) emit("open");
    };
    if (native) {
      dialog.removeAttribute("open");
      trigger.setAttribute("aria-haspopup", "dialog");
      dialog.dataset.enhanced = "";
    }
    trigger.setAttribute("aria-expanded", "false");
    dialog.querySelector<HTMLElement>('[data-slot="hraness-mailing-close"]')?.removeAttribute("hidden");
    const cancel = (event: Event) => { event.preventDefault(); dismiss("escape"); };
    const closed = () => { if (modalOpen.current && !dialog.open) dismiss("dismiss_button"); };
    const backdrop = (event: MouseEvent) => {
      if (event.target !== dialog || !native) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss("backdrop");
    };
    dialog.addEventListener("cancel", cancel);
    dialog.addEventListener("close", closed);
    dialog.addEventListener("click", backdrop);
    window.visualViewport?.addEventListener("resize", viewport);
    window.visualViewport?.addEventListener("scroll", viewport);
    window.addEventListener("resize", viewport);
    closeModal.current = dismiss;
    openModal.current = () => reveal();
    if (modalOpen.current) reveal(false);
    return () => {
      dialog.removeEventListener("cancel", cancel);
      dialog.removeEventListener("close", closed);
      dialog.removeEventListener("click", backdrop);
      window.visualViewport?.removeEventListener("resize", viewport);
      window.visualViewport?.removeEventListener("scroll", viewport);
      window.removeEventListener("resize", viewport);
      if (native && dialog.open) dialog.close();
      unlock();
      closeModal.current = () => {};
      openModal.current = () => {};
    };
  }, [innerHtml, emit]);

  useLayoutEffect(() => {
    if (mailingList.kind !== "signup") return;
    const copy = stableFooterMessages(locale, mailingList.audience);
    const form = footer.current?.querySelector<HTMLFormElement>(`form[data-slot="${HRANESS_MAILING_FORM_SLOT}"]`);
    const status = footer.current?.querySelector<HTMLElement>(`[data-slot="${HRANESS_MAILING_STATUS_SLOT}"]`);
    if (!form || !status) return;
    const pending = renderState.kind === "pending";
    const accepted = renderState.kind === "accepted";
    form.hidden = accepted;
    form.dataset.state = renderState.kind;
    form.setAttribute("aria-busy", String(pending));
    const input = form.querySelector<HTMLInputElement>('input[name="email"]');
    if (input) input.readOnly = pending;
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) {
      button.disabled = pending || accepted;
      button.setAttribute("aria-disabled", String(button.disabled));
      button.textContent = pending ? copy.pending : copy.submit;
    }
    status.className = mailingStatusClassName(renderState.kind);
    status.dataset.state = renderState.kind;
    status.setAttribute("role", renderState.kind === "error" ? "alert" : "status");
    status.setAttribute("aria-live", renderState.kind === "error" ? "assertive" : "polite");
    status.textContent = pending ? copy.submitting : accepted ? copy.accepted : renderState.kind === "error" ? copy.requestError : "";
    if (modalOpen.current && renderState.kind === "error") input?.focus({ preventScroll: true });
    else if (modalOpen.current && accepted) status.focus({ preventScroll: true });
  }, [innerHtml, renderState, locale]);

  useEffect(() => {
    if (!onConversion || mailingList.kind !== "signup" || impressionSent.current || typeof IntersectionObserver !== "function") return;
    const target = footer.current?.querySelector('[data-slot="hraness-mailing-disclosure"] > summary');
    if (!target) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    const update = () => {
      if (timer !== undefined) clearTimeout(timer);
      if (visible && document.visibilityState === "visible" && !impressionSent.current) timer = setTimeout(() => {
        if (emit("impression")) impressionSent.current = true;
      }, 400);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5);
      update();
    }, { threshold: 0.5 });
    observer.observe(target);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); if (timer !== undefined) clearTimeout(timer); document.removeEventListener("visibilitychange", update); };
  }, [Boolean(onConversion), mailingListKey, innerHtml, emit]);

  useLayoutEffect(() => {
    const inner = footer.current?.querySelector<HTMLElement>(".hraness-site-footer__inner");
    if (!inner) return;
    let link = inner.querySelector<HTMLAnchorElement>('[data-slot="hraness-support-link"]');
    if (supportLink === null) link?.remove();
    else {
      if (!link) {
        link = inner.ownerDocument.createElement("a");
        link.className = footerClasses.support;
        link.dataset.slot = "hraness-support-link";
        link.lang = "en";
        link.dir = "ltr";
        link.innerHTML = HRANESS_SUPPORT_ICON_HTML;
        inner.insertBefore(link, inner.querySelector(`[data-slot="${HRANESS_CONSENT_SLOT}"]`));
      }
      link.setAttribute("href", supportLink.href);
      link.setAttribute("aria-label", supportLink.label);
      link.setAttribute("title", supportLink.title);
    }
    inner.className = footerInnerClassName(mailingList.kind === "signup", placement === "sticky", variant.color, mailingList.kind === "account", supportLink !== null, showBrand);
  }, [innerHtml, JSON.stringify(supportLink)]);

  useEffect(() => {
    if (footer.current === null || mailingList.kind !== "signup") return;
    return attachFooterFoil(footer.current);
  }, [innerHtml, mailingListKey]);

  // Cookie consent is a one-way localStorage decision; geo detection is advisory
  // and fails toward showing the note.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(HRANESS_CONSENT_STORAGE_KEY) === "accepted") return;
    } catch {
      // Storage disabled: the in-memory accept still applies for this page.
    }
    const controller = new AbortController();
    void fetch(HRANESS_CONSENT_REGION_URL, {
      cache: "no-store",
      credentials: "omit",
      headers: { accept: "application/json" },
      signal: controller.signal,
    }).then(async (response) => {
      const body: unknown = await response.json();
      const required = typeof body === "object" && body !== null
        ? Reflect.get(body, "required") === true
        : true;
      if (!controller.signal.aborted) setConsentPending(required);
    }).catch(() => {
      if (!controller.signal.aborted) setConsentPending(true);
    });
    return () => { controller.abort(); };
  }, []);

  // The dangerouslySetInnerHTML content is rebuilt on state changes, so the
  // revealed consent element must be re-marked whenever the markup changes.
  useEffect(() => {
    const target = footer.current?.querySelector(`[data-slot="${HRANESS_CONSENT_SLOT}"]`);
    if (!(target instanceof Element)) return;
    if (consentPending) target.removeAttribute("hidden");
    else target.setAttribute("hidden", "");
  }, [innerHtml, consentPending]);

  return createElement("footer", {
    "aria-label": HRANESS_FOOTER_LABEL,
    className: footerClassName(mailingList.kind === "signup", placement === "sticky"),
    "data-brand": showBrand ? "visible" : "hidden",
    "data-mailing-list": mailingList.kind,
    "data-slot": HRANESS_FOOTER_SLOT,
    id: HRANESS_FOOTER_SLOT,
    // The HTML is composed only from validated package-owned constants and state.
    dangerouslySetInnerHTML: innerHtmlProp,
    onClick: (event: { target: EventTarget | null; defaultPrevented: boolean; preventDefault: () => void }) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const summary = target.closest('[data-slot="hraness-mailing-disclosure"] > summary');
      if (summary !== null && !event.defaultPrevented) {
        event.preventDefault();
        openModal.current();
        return;
      }
      if (target.closest('[data-slot="hraness-mailing-close"]')) { closeModal.current("dismiss_button"); return; }
      if (target.closest(`[data-slot="${HRANESS_CONSENT_ACCEPT_SLOT}"]`) === null) return;
      try {
        window.localStorage.setItem(HRANESS_CONSENT_STORAGE_KEY, "accepted");
      } catch {
        // Private browsing or disabled storage: hide for this page only.
      }
      setConsentPending(false);
    },
    onSubmit: handleSubmit,
    onInputCapture: (event: { target: EventTarget | null }) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.name !== "email") return;
      interacted.current = true;
      draft.current = target.value;
      if (target.value !== "" && !inputStarted.current && emit("input_started")) inputStarted.current = true;
    },
    onInvalidCapture: (event: { target: EventTarget | null }) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.name === "email") emit("validation_failed", target.value === "" ? "required_email" : "invalid_email");
    },
    onKeyDown: (event: { key: string; shiftKey: boolean; preventDefault: () => void }) => {
      if (!modalOpen.current) return;
      if (event.key === "Escape") { event.preventDefault(); closeModal.current("escape"); }
      if (event.key === "Tab") {
        const dialog = footer.current?.querySelector<HTMLDialogElement>('[data-slot="hraness-mailing-dialog"]');
        const controls = [...(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not([type="hidden"]):not(:disabled), a[href], [tabindex="0"]') ?? [])]
          .filter(control => control.tabIndex >= 0 && !control.closest("[hidden]"));
        const first = controls[0];
        const last = controls.at(-1);
        if (first && last && ((event.shiftKey ? document.activeElement === first : document.activeElement === last)
          || !controls.includes(document.activeElement as HTMLElement))) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus({ preventScroll: true });
        }
      }
    },
    ref: footer,
  });
}
