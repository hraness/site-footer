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

interface TurnstileRenderOptions {
  readonly action: string;
  readonly appearance: "interaction-only";
  readonly callback: (token: string) => void;
  readonly execution: "render";
  readonly "error-callback": () => void;
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

function loadTurnstile(): Promise<TurnstileApi> {
  const installed = installedTurnstile();
  if (installed !== undefined) return Promise.resolve(installed);
  if (turnstileScriptPromise !== null) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const scripts = document.querySelectorAll<HTMLScriptElement>("script[src]");
    const existing = [...scripts].find(isTurnstileScript);
    const reusable = existing?.dataset.hranessTurnstileLoading === "true";
    if (existing !== undefined && !reusable) existing.remove();
    const script = reusable ? existing : document.createElement("script");

    const cleanup = () => {
      script.removeEventListener("error", handleError);
      script.removeEventListener("load", handleLoad);
    };
    const handleError = () => {
      cleanup();
      script.remove();
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

    if (!reusable) {
      script.async = true;
      script.defer = true;
      script.dataset.slot = HRANESS_TURNSTILE_SCRIPT_SLOT;
      script.dataset.hranessTurnstileLoading = "true";
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
}: HranessSiteFooterProps) {
  const mailingList = parseHranessMailingListConfig(mailingListInput);
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

    const resetWidget = () => {
      turnstileToken.current = null;
      if (cancelled || ownedWidget === null) return;
      try {
        turnstileApi.current?.reset(ownedWidget);
      } catch {
        setWidgetRevision((revision) => revision + 1);
      }
    };
    const reportChallengeError = () => {
      if (cancelled) return;
      const email = footer.current
        ?.querySelector<HTMLInputElement>('input[name="email"]')
        ?.value ?? "";
      resetWidget();
      setState({
        audience: mailingList.audience,
        email,
        kind: "verification-error",
      });
    };

    void loadTurnstile().then((api) => {
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
          if (!cancelled) turnstileToken.current = token;
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
  }, [mailingList, renderState.kind, widgetRevision]);

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
    if (token === null || token.length === 0) {
      setState({
        audience: mailingList.audience,
        email,
        kind: "verification-error",
      });
      setWidgetRevision((revision) => revision + 1);
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
  }, [mailingList, renderState.kind]);

  const innerHtml = useMemo(
    () => renderHranessSiteFooterInnerHtml(
      showBrand,
      mailingList,
      renderState,
      "explicit",
    ),
    [mailingList, renderState, showBrand],
  );

  return createElement("footer", {
    "aria-label": HRANESS_FOOTER_LABEL,
    className: HRANESS_FOOTER_CLASS_NAME,
    "data-brand": showBrand ? "visible" : "hidden",
    "data-mailing-list": mailingList.kind,
    "data-slot": HRANESS_FOOTER_SLOT,
    id: HRANESS_FOOTER_SLOT,
    // The HTML is composed only from validated package-owned constants and state.
    dangerouslySetInnerHTML: { __html: innerHtml },
    onSubmit: handleSubmit,
    ref: footer,
  });
}
