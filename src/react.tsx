"use client";

import {
  HRANESS_FOOTER_CLASS_NAME,
  HRANESS_FOOTER_LABEL,
  HRANESS_FOOTER_SLOT,
  HRANESS_MAILING_FORM_SLOT,
  HRANESS_MAILING_SOURCE,
  HRANESS_MAILING_STATUS_SLOT,
  HRANESS_MAILING_SUBSCRIBE_URL,
  HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL,
  HRANESS_TURNSTILE_RESPONSE_FIELD,
  HRANESS_TURNSTILE_SCRIPT_SLOT,
  HRANESS_TURNSTILE_SCRIPT_URL,
  HRANESS_TURNSTILE_WIDGET_SLOT,
  getHranessMailingTurnstileAction,
  parseHranessMailingListConfig,
  parseHranessTurnstileScriptNonce,
  renderHranessSiteFooterInnerHtml,
  type HranessMailingListConfig,
  type HranessMailingListRenderState,
} from "./internal.js";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

type TurnstileWidgetId = string;

const MAX_TURNSTILE_TOKEN_LENGTH = 2_048;
const TURNSTILE_SCRIPT_LOAD_TIMEOUT_MS = 15_000;

interface TurnstileRenderOptions {
  readonly action: string;
  readonly appearance: "interaction-only";
  readonly callback: (token: string) => void;
  readonly execution: "render";
  readonly "error-callback": (errorCode?: string) => void;
  readonly "expired-callback": () => void;
  readonly "refresh-expired": "auto";
  readonly "refresh-timeout": "auto";
  readonly "response-field": true;
  readonly "response-field-name": typeof HRANESS_TURNSTILE_RESPONSE_FIELD;
  readonly retry: "auto";
  readonly sitekey: string;
  readonly size: "flexible";
  readonly theme: "auto";
  readonly "timeout-callback": () => void;
  readonly "unsupported-callback": () => void;
}

interface TurnstileApi {
  readonly remove: (widget: TurnstileWidgetId) => void;
  readonly render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => TurnstileWidgetId;
  readonly reset: (widget: TurnstileWidgetId) => void;
}

let turnstileScriptPromise: Promise<TurnstileApi> | null = null;

function installedTurnstile(): TurnstileApi | undefined {
  return (window as Window & { turnstile?: TurnstileApi }).turnstile;
}

function isTurnstileScript(script: HTMLScriptElement): boolean {
  try {
    const candidate = new URL(script.src, document.baseURI);
    const canonical = new URL(HRANESS_TURNSTILE_SCRIPT_URL);
    return candidate.origin === canonical.origin
      && candidate.pathname === canonical.pathname;
  } catch {
    return false;
  }
}

function isTurnstileToken(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= MAX_TURNSTILE_TOKEN_LENGTH;
}

function loadTurnstile(scriptNonce?: string): Promise<TurnstileApi> {
  const installed = installedTurnstile();
  if (installed !== undefined) return Promise.resolve(installed);
  if (turnstileScriptPromise !== null) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const scripts = document.querySelectorAll<HTMLScriptElement>("script[src]");
    const existing = [...scripts].find(isTurnstileScript);
    const ownsScript = existing === undefined;
    const script = existing ?? document.createElement("script");
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      if (timeout !== undefined) clearTimeout(timeout);
      script.removeEventListener("error", handleError);
      script.removeEventListener("load", handleLoad);
    };
    const handleError = () => {
      cleanup();
      if (ownsScript) script.remove();
      reject(new Error("Cloudflare Turnstile could not be loaded."));
    };
    const handleLoad = () => {
      const api = installedTurnstile();
      if (api === undefined) {
        handleError();
        return;
      }
      cleanup();
      delete script.dataset.hranessTurnstileLoading;
      script.dataset.hranessTurnstileLoaded = "true";
      resolve(api);
    };

    script.addEventListener("error", handleError, { once: true });
    script.addEventListener("load", handleLoad, { once: true });
    timeout = setTimeout(handleError, TURNSTILE_SCRIPT_LOAD_TIMEOUT_MS);

    if (ownsScript) {
      script.async = true;
      script.defer = true;
      script.dataset.slot = HRANESS_TURNSTILE_SCRIPT_SLOT;
      script.dataset.hranessTurnstileLoading = "true";
      if (scriptNonce !== undefined) script.setAttribute("nonce", scriptNonce);
      script.src = HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL;
      document.head.append(script);
    } else if (installedTurnstile() !== undefined) {
      queueMicrotask(handleLoad);
    }
  }).catch((error: unknown) => {
    turnstileScriptPromise = null;
    throw error;
  });

  return turnstileScriptPromise;
}

export interface HranessSiteFooterProps {
  /** Explicitly select one mailing-list audience or omit mailing-list UI. */
  readonly mailingList: HranessMailingListConfig;
  /** Omit the Hraness home link when the containing site already supplies that identity. */
  readonly showBrand?: boolean;
  /** Optional per-response CSP nonce used only when this component inserts Turnstile. */
  readonly turnstileScriptNonce?: string;
}

const IDLE_STATE = { kind: "idle" } as const satisfies HranessMailingListRenderState;

function activeStateFor(
  mailingList: HranessMailingListConfig,
  state: HranessMailingListRenderState,
): HranessMailingListRenderState {
  if (mailingList.kind === "none" || state.kind === "idle") return IDLE_STATE;
  return state.audience === mailingList.audience ? state : IDLE_STATE;
}

/** Progressively enhance the canonical native mailing-list form when JavaScript is available. */
export function HranessSiteFooter({
  mailingList: mailingListInput,
  showBrand = true,
  turnstileScriptNonce: turnstileScriptNonceInput,
}: HranessSiteFooterProps) {
  const mailingList = parseHranessMailingListConfig(mailingListInput);
  const turnstileScriptNonce = parseHranessTurnstileScriptNonce(
    turnstileScriptNonceInput,
  );
  const [state, setState] = useState<HranessMailingListRenderState>(IDLE_STATE);
  const [widgetRevision, setWidgetRevision] = useState(0);
  const activeRequest = useRef<AbortController | null>(null);
  const footer = useRef<HTMLElement | null>(null);
  const turnstileApi = useRef<TurnstileApi | null>(null);
  const turnstileToken = useRef<string | null>(null);
  const turnstileWidget = useRef<TurnstileWidgetId | null>(null);
  const mailingListKey = mailingList.kind === "signup"
    ? `signup:${mailingList.audience}:${mailingList.turnstileSitekey}`
    : "none";
  const renderState = activeStateFor(mailingList, state);

  useEffect(() => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    turnstileToken.current = null;
    setState(IDLE_STATE);
  }, [mailingListKey]);

  useEffect(() => () => {
    activeRequest.current?.abort();
  }, []);

  useEffect(() => {
    if (
      mailingList.kind !== "signup"
      || renderState.kind === "accepted"
      || renderState.kind === "pending"
    ) {
      return;
    }

    let cancelled = false;
    let ownedWidget: TurnstileWidgetId | null = null;

    const setVerificationPending = () => {
      turnstileToken.current = null;
      const button = footer.current?.querySelector<HTMLButtonElement>(
        `button[data-slot="${HRANESS_MAILING_FORM_SLOT}-submit"]`,
      );
      if (button === null || button === undefined) return;
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
      button.textContent = "Verifying…";
    };
    const setVerificationReady = (token: string) => {
      turnstileToken.current = token;
      const form = footer.current?.querySelector<HTMLFormElement>(
        `form[data-slot="${HRANESS_MAILING_FORM_SLOT}"]`,
      );
      const button = form?.querySelector<HTMLButtonElement>(
        `button[data-slot="${HRANESS_MAILING_FORM_SLOT}-submit"]`,
      );
      if (button !== null && button !== undefined) {
        button.disabled = false;
        button.removeAttribute("aria-disabled");
        button.textContent = "Subscribe";
      }
      if (form?.dataset.state === "verification-error") {
        form.dataset.state = "idle";
        const status = form.querySelector<HTMLElement>(
          `[data-slot="${HRANESS_MAILING_STATUS_SLOT}"]`,
        );
        if (status !== null) {
          status.setAttribute("aria-live", "polite");
          status.setAttribute("role", "status");
          status.textContent = "";
        }
      }
    };

    const resetWidget = () => {
      setVerificationPending();
      if (cancelled || ownedWidget === null) return;
      try {
        turnstileApi.current?.reset(ownedWidget);
      } catch {
        setWidgetRevision((revision) => revision + 1);
      }
    };
    const reportChallengeError = (_errorCode?: string) => {
      if (cancelled) return;
      setVerificationPending();
      const form = footer.current?.querySelector<HTMLFormElement>(
        `form[data-slot="${HRANESS_MAILING_FORM_SLOT}"]`,
      );
      if (form === null || form === undefined) return;
      form.dataset.state = "verification-error";
      const status = form.querySelector<HTMLElement>(
        `[data-slot="${HRANESS_MAILING_STATUS_SLOT}"]`,
      );
      if (status !== null) {
        status.setAttribute("aria-live", "assertive");
        status.setAttribute("role", "alert");
        status.textContent = "Security check failed. Try again.";
      }
      const button = form.querySelector<HTMLButtonElement>(
        `button[data-slot="${HRANESS_MAILING_FORM_SLOT}-submit"]`,
      );
      if (button !== null) {
        button.disabled = false;
        button.removeAttribute("aria-disabled");
        button.textContent = "Retry security check";
      }
      form.querySelector<HTMLInputElement>('input[name="email"]')
        ?.focus({ preventScroll: true });
    };

    void loadTurnstile(turnstileScriptNonce).then((api) => {
      if (cancelled) return;
      const container = footer.current?.querySelector<HTMLElement>(
        `[data-slot="${HRANESS_TURNSTILE_WIDGET_SLOT}"]`,
      );
      if (container === null || container === undefined) return;

      turnstileApi.current = api;
      ownedWidget = api.render(container, {
        action: getHranessMailingTurnstileAction(mailingList.audience),
        appearance: "interaction-only",
        callback: (token) => {
          if (cancelled) return;
          if (!isTurnstileToken(token)) {
            reportChallengeError();
            return;
          }
          setVerificationReady(token);
        },
        execution: "render",
        "error-callback": reportChallengeError,
        "expired-callback": resetWidget,
        "refresh-expired": "auto",
        "refresh-timeout": "auto",
        "response-field": true,
        "response-field-name": HRANESS_TURNSTILE_RESPONSE_FIELD,
        retry: "auto",
        sitekey: mailingList.turnstileSitekey,
        size: "flexible",
        theme: "auto",
        "timeout-callback": resetWidget,
        "unsupported-callback": reportChallengeError,
      });
      turnstileWidget.current = ownedWidget;
    }).catch(() => {
      reportChallengeError();
    });

    return () => {
      cancelled = true;
      turnstileToken.current = null;
      if (ownedWidget !== null) {
        try {
          turnstileApi.current?.remove(ownedWidget);
        } catch {
          // The host page may have removed the package-owned container first.
        }
      }
      if (turnstileWidget.current === ownedWidget) {
        turnstileWidget.current = null;
      }
    };
  }, [mailingListKey, renderState.kind, showBrand, turnstileScriptNonce, widgetRevision]);

  useEffect(() => {
    if (renderState.kind === "idle") return;

    if (renderState.kind === "error" || renderState.kind === "verification-error") {
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
      || mailingList.kind !== "signup"
      || typeof fetch !== "function"
      || typeof FormData !== "function"
      || typeof AbortController !== "function"
    ) {
      return;
    }

    const emailControl = target.querySelector('input[name="email"]');
    if (!(emailControl instanceof HTMLInputElement)) return;

    event.preventDefault();
    if (renderState.kind === "pending" || renderState.kind === "accepted") return;

    const email = emailControl.value;
    const token = turnstileToken.current;
    if (!isTurnstileToken(token)) {
      if (target.dataset.state === "verification-error") {
        target.dataset.state = "idle";
        const status = target.querySelector<HTMLElement>(
          `[data-slot="${HRANESS_MAILING_STATUS_SLOT}"]`,
        );
        if (status !== null) {
          status.setAttribute("aria-live", "polite");
          status.setAttribute("role", "status");
          status.textContent = "";
        }
        const button = target.querySelector<HTMLButtonElement>(
          `button[data-slot="${HRANESS_MAILING_FORM_SLOT}-submit"]`,
        );
        if (button !== null) {
          button.disabled = true;
          button.setAttribute("aria-disabled", "true");
          button.textContent = "Verifying…";
        }
        setWidgetRevision((revision) => revision + 1);
      }
      return;
    }
    const body = new FormData();
    body.set("audience", mailingList.audience);
    body.set("email", email);
    body.set("source", HRANESS_MAILING_SOURCE);
    body.set(HRANESS_TURNSTILE_RESPONSE_FIELD, token);
    const request = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = request;
    turnstileToken.current = null;
    setState({ audience: mailingList.audience, email, kind: "pending" });

    void fetch(HRANESS_MAILING_SUBSCRIBE_URL, {
      body,
      credentials: "omit",
      headers: { accept: "application/json" },
      method: "POST",
      signal: request.signal,
    }).then((response) => {
      if (activeRequest.current !== request) return;
      activeRequest.current = null;
      setState(response.ok
        ? { audience: mailingList.audience, kind: "accepted" }
        : { audience: mailingList.audience, email, kind: "error" });
    }).catch(() => {
      if (activeRequest.current !== request || request.signal.aborted) return;
      activeRequest.current = null;
      setState({ audience: mailingList.audience, email, kind: "error" });
    });
  }, [mailingListKey, renderState.kind]);

  const innerHtml = useMemo(
    () => renderHranessSiteFooterInnerHtml(
      showBrand,
      mailingList,
      renderState,
      "explicit",
    ),
    [mailingListKey, renderState, showBrand],
  );
  const innerHtmlProp = useMemo(() => ({ __html: innerHtml }), [innerHtml]);

  return createElement("footer", {
    "aria-label": HRANESS_FOOTER_LABEL,
    className: HRANESS_FOOTER_CLASS_NAME,
    "data-brand": showBrand ? "visible" : "hidden",
    "data-mailing-list": mailingList.kind,
    "data-slot": HRANESS_FOOTER_SLOT,
    id: HRANESS_FOOTER_SLOT,
    // The HTML is composed only from validated package-owned constants and state.
    dangerouslySetInnerHTML: innerHtmlProp,
    onSubmit: handleSubmit,
    ref: footer,
  });
}
