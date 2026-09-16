"use client";
import type { SupportProfile } from "./internal.js";

import { attachFooterFoil } from "./foil.js";
import { footerClassName, footerClasses, footerInnerClassName } from "./footer.stylex.js";
import { resolveFooterLocale } from "./locales.js";
import { DEFAULT_FOOTER_VARIANT, FOOTER_WIDE_QUERY, isFooterEnrollmentEligible, exposeFooterEnrollment, requestFooterEnrollment, type FooterEnrollment, type FooterViewport } from "./experiment.js";

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
  /** Accounts owns assignment and confirmed-subscription analytics. Disable for fixtures or an intentional holdback. */
  readonly experiment?: boolean;
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
  experiment = true,
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
  const [enrollment, setEnrollment] = useState<FooterEnrollment | null>(null);
  const interacted = useRef(false);
  const exposedEnrollment = useRef<string | null>(null);
  const enrollmentViewport = useRef<FooterViewport | null>(null);
  const enrollmentRequest = useRef<AbortController | null>(null);
  const exposureRequest = useRef<AbortController | null>(null);
  const enrollmentKey = useRef<string | null>(null);
  const enrollmentToken = useRef<string | null>(null);
  const activeContext = useRef({ key: mailingListKey, experiment, signup: mailingList.kind === "signup" });
  const mounted = useRef(false);
  const variant = enrollment?.assignment ?? DEFAULT_FOOTER_VARIANT;
  // Keep markup identity stable on resize, including a later host/consent render.
  // Attribution is invalidated separately without reconstructing an active form.
  const experimentToken = enrollmentViewport.current === null ? undefined : enrollment?.token;
  const presentationKey = `${enrollment?.token ?? "none"}:${locale.locale}:${variant.layout}:${variant.copyStyle}:${variant.color}:${variant.shimmer}:${placement}`;
  const activeRequest = useRef<AbortController | null>(null);
  const footer = useRef<HTMLElement | null>(null);
  const socialKey = socialLinks
    .map((link) => `${link.platform}:${link.href}:${link.label}`)
    .join("|");
  const renderState = activeStateFor(mailingList, state);
  // A committed auth change invalidates attribution before events or timers can
  // run. Keep an interacted form intact during a session refresh, including the
  // native-submit path used by hosts that bypass this adapter's submit handler.
  useLayoutEffect(() => {
    const previous = activeContext.current;
    const modeChanged = previous.key !== mailingListKey;
    if (!modeChanged && previous.experiment === experiment) return;
    activeContext.current = { key: mailingListKey, experiment, signup: mailingList.kind === "signup" };
    enrollmentRequest.current?.abort();
    exposureRequest.current?.abort();
    enrollmentViewport.current = null;
    enrollmentKey.current = null;
    enrollmentToken.current = null;
    exposedEnrollment.current = null;
    const token = footer.current?.querySelector<HTMLInputElement>('input[name="experimentToken"]');
    if (token) { token.disabled = true; token.value = ""; }
    if (modeChanged) {
      interacted.current = false;
      activeRequest.current?.abort();
      activeRequest.current = null;
    }
  }, [mailingListKey, experiment]);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      enrollmentViewport.current = null;
      enrollmentKey.current = null;
      enrollmentToken.current = null;
      activeRequest.current?.abort();
      enrollmentRequest.current?.abort();
      exposureRequest.current?.abort();
    };
  }, []);

  const markExposure = useCallback((token: string) => {
    const context = activeContext.current;
    const currentViewport = typeof window.matchMedia === "function" && !window.matchMedia(FOOTER_WIDE_QUERY).matches ? "compact" : "wide";
    if (!mounted.current || !context.signup || !context.experiment || enrollmentKey.current !== context.key || enrollmentToken.current !== token || enrollmentViewport.current !== currentViewport) return false;
    if (exposedEnrollment.current === token) return true;
    exposedEnrollment.current = token;
    const controller = new AbortController();
    exposureRequest.current?.abort();
    exposureRequest.current = controller;
    void exposeFooterEnrollment(token, controller.signal);
    return true;
  }, []);

  useEffect(() => {
    const selectedLocale = resolveFooterLocale(localeInput ?? navigator.languages);
    setLocale(selectedLocale);
    if (mailingList.kind !== "signup") { setEnrollment(null); return; }
    if (!experiment) return;
    const context = activeContext.current;
    const query = typeof window.matchMedia === "function" ? window.matchMedia(FOOTER_WIDE_QUERY) : null;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const assign = () => {
      if (!mounted.current || activeContext.current !== context || !context.signup || !context.experiment) return;
      enrollmentRequest.current?.abort();
      exposureRequest.current?.abort();
      exposedEnrollment.current = null;
      if (timeout) clearTimeout(timeout);
      const tokenInput = footer.current?.querySelector<HTMLInputElement>('input[name="experimentToken"]');
      if (tokenInput) { tokenInput.disabled = true; tokenInput.value = ""; }
      enrollmentViewport.current = null;
      enrollmentKey.current = null;
      enrollmentToken.current = null;
      // CSS handles resizing without rebuilding an active form or losing its text.
      if (interacted.current) return;
      setEnrollment(null);
      const viewport: FooterViewport = query?.matches === false ? "compact" : "wide";
      const controller = new AbortController();
      enrollmentRequest.current = controller;
      timeout = setTimeout(() => controller.abort(), 1_500);
      void requestFooterEnrollment(mailingList.audience, selectedLocale.locale, controller.signal, viewport)
        .then((result) => {
          if (activeContext.current === context && !controller.signal.aborted && !interacted.current && result !== null
            && isFooterEnrollmentEligible(result, selectedLocale.locale, viewport, typeof CSS !== "undefined" && CSS.supports("selector(::details-content)"))) {
            enrollmentViewport.current = viewport;
            enrollmentKey.current = context.key;
            enrollmentToken.current = result.token;
            setEnrollment(result);
          }
        }).finally(() => { if (enrollmentRequest.current === controller && timeout) clearTimeout(timeout); });
    };
    assign();
    query?.addEventListener("change", assign);
    return () => { if (timeout) clearTimeout(timeout); enrollmentRequest.current?.abort(); query?.removeEventListener("change", assign); };
  }, [mailingListKey, experiment, typeof localeInput === "string" ? localeInput : localeInput?.join(",")]);

  useEffect(() => {
    if (mailingList.kind !== "signup" || !experiment || enrollmentKey.current !== mailingListKey || enrollment === null || footer.current === null || typeof IntersectionObserver !== "function") return;
    const useButton = enrollmentViewport.current === "compact" || enrollment.assignment.layout === "button";
    const target = footer.current.querySelector(useButton
      ? '[data-slot="hraness-mailing-disclosure"] > summary'
      : `form[data-slot="${HRANESS_MAILING_FORM_SLOT}"]`);
    if (target === null) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    let sent = false;
    const update = () => {
      if (timer !== undefined) clearTimeout(timer);
      if (visible && document.visibilityState === "visible" && !sent) {
        timer = setTimeout(() => {
          sent = true;
          markExposure(enrollment.token);
        }, 400);
      }
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);
      update();
    }, { threshold: 0.5 });
    observer.observe(target);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      if (timer !== undefined) clearTimeout(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [enrollment, markExposure, mailingListKey, experiment]);

  useEffect(() => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setState(IDLE_STATE);
  }, [mailingListKey]);

  useEffect(() => () => {
    activeRequest.current?.abort();
    enrollmentRequest.current?.abort();
    exposureRequest.current?.abort();
  }, []);

  useEffect(() => {
    if (renderState.kind === "idle") return;

    if (renderState.kind === "error") {
      const emailControl = footer.current?.querySelector<HTMLInputElement>(
        'input[name="email"]',
      );
      emailControl?.focus({ preventScroll: true });
      return;
    }

    const status = footer.current?.querySelector<HTMLElement>(
      `[data-slot="${HRANESS_MAILING_STATUS_SLOT}"]`,
    );
    status?.focus({ preventScroll: true });
  }, [renderState]);

  const handleSubmit = useCallback((event: FormEvent<HTMLElement>) => {
    const target = event.target;
    if (
      !(target instanceof HTMLElement)
      || target.tagName !== "FORM"
      || target.dataset.slot !== HRANESS_MAILING_FORM_SLOT
      || !mounted.current
      || mailingList.kind !== "signup"
      || activeContext.current.key !== mailingListKey
      || typeof fetch !== "function"
      || typeof FormData !== "function"
      || typeof AbortController !== "function"
    ) {
      return;
    }

    const emailControl = target.querySelector('input[name="email"]');
    if (!(emailControl instanceof HTMLInputElement)) return;

    event.preventDefault();
    if (activeRequest.current !== null || renderState.kind === "pending" || renderState.kind === "accepted") return;

    const email = emailControl.value;
    const honeypot = target.querySelector('input[name="website"]');
    const body = new FormData();
    body.set("audience", mailingList.audience);
    body.set("email", email);
    body.set("source", HRANESS_MAILING_SOURCE);
    body.set("website", honeypot instanceof HTMLInputElement ? honeypot.value : "");
    const currentViewport = typeof window.matchMedia === "function" && !window.matchMedia(FOOTER_WIDE_QUERY).matches ? "compact" : "wide";
    if (enrollment !== null && enrollmentViewport.current === currentViewport && markExposure(enrollment.token)) {
      body.set("experimentToken", enrollment.token);
    }
    const request = new AbortController();
    const requestContext = activeContext.current;
    activeRequest.current = request;
    setState({ audience: mailingList.audience, email, kind: "pending" });

    void fetch(HRANESS_MAILING_SUBSCRIBE_URL, {
      body,
      credentials: "omit",
      headers: { accept: "application/json" },
      method: "POST",
      signal: request.signal,
    }).then((response) => {
      if (request.signal.aborted || activeRequest.current !== request || activeContext.current.key !== requestContext.key) return;
      activeRequest.current = null;
      setState(response.ok
        ? { audience: mailingList.audience, kind: "accepted" }
        : { audience: mailingList.audience, email, kind: "error" });
    }).catch(() => {
      if (activeRequest.current !== request || request.signal.aborted || activeContext.current.key !== requestContext.key) return;
      activeRequest.current = null;
      setState({ audience: mailingList.audience, email, kind: "error" });
    });
  }, [mailingListKey, renderState.kind, enrollment, presentationKey, markExposure]);

  const innerHtml = useMemo(
    () => renderHranessSiteFooterInnerHtml(
      showBrand,
      mailingList,
      renderState,
      socialLinks,
      { locale, variant, sticky: placement === "sticky", ...(experimentToken ? { experimentToken } : {}), ...(support === undefined ? {} : { support }) },
    ),
    // Support-only updates patch their own link below, preserving an active
    // native form, disclosure, focus, and in-flight request.
    [mailingListKey, renderState, showBrand, socialKey, presentationKey],
  );
  const innerHtmlProp = useMemo(() => ({ __html: innerHtml }), [innerHtml]);

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
        link.textContent = "Support";
        inner.insertBefore(link, inner.querySelector(`[data-slot="${HRANESS_CONSENT_SLOT}"]`));
      }
      link.setAttribute("href", supportLink.href);
      link.setAttribute("aria-label", supportLink.label);
      link.setAttribute("title", supportLink.title);
    }
    inner.className = footerInnerClassName(mailingList.kind === "signup", placement === "sticky", variant.color, mailingList.kind === "account", supportLink !== null);
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
        const disclosure = summary.parentElement as HTMLDetailsElement;
        event.preventDefault();
        disclosure.open = !disclosure.open;
        // Focus in the activation event itself so mobile keyboards may open.
        // Deferring to toggle, an effect or a frame loses that user gesture.
        if (disclosure.open) disclosure.querySelector<HTMLInputElement>('input[name="email"]')?.focus({ preventScroll: true });
        else (summary as HTMLElement).focus({ preventScroll: true });
        return;
      }
      if (target.closest(`[data-slot="${HRANESS_CONSENT_ACCEPT_SLOT}"]`) === null) return;
      try {
        window.localStorage.setItem(HRANESS_CONSENT_STORAGE_KEY, "accepted");
      } catch {
        // Private browsing or disabled storage: hide for this page only.
      }
      setConsentPending(false);
    },
    onSubmit: handleSubmit,
    onPointerDownCapture: () => { interacted.current = true; enrollmentRequest.current?.abort(); },
    onFocusCapture: () => { interacted.current = true; enrollmentRequest.current?.abort(); },
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (event.key !== "Escape") return;
      const disclosures = footer.current?.querySelectorAll("details[open]");
      const last = disclosures === undefined || disclosures.length === 0
        ? null
        : disclosures[disclosures.length - 1] as HTMLDetailsElement;
      if (last !== null) {
        event.preventDefault(); last.open = false; last.querySelector("summary")?.focus();
      }
    },
    ref: footer,
  });
}
