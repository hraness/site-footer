import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import { HranessSiteFooter } from "../../../../src/react.js";
import "../../../../styles.css";
import "./fixture.css";

const TURNSTILE_TEST_SITEKEY = "1x00000000000000000000AA";
const MAILING_URL = "https://account.hraness.com/api/mailing/subscribe";
const TEST_EMAIL = "footer-fixture@example.test";

const fixtureStates = [
  "idle",
  "pending",
  "accepted",
  "error",
  "verification-error",
] as const;

type FixtureState = typeof fixtureStates[number];

interface TurnstileOptions {
  readonly action: string;
  readonly appearance: string;
  readonly callback: (token: string) => void;
  readonly execution: string;
  readonly "error-callback": () => void;
  readonly "expired-callback": () => void;
  readonly "refresh-expired": string;
  readonly "refresh-timeout": string;
  readonly "response-field": boolean;
  readonly "response-field-name": string;
  readonly retry: string;
  readonly sitekey: string;
  readonly size: string;
  readonly theme: string;
  readonly "timeout-callback": () => void;
  readonly "unsupported-callback": () => void;
}

interface RecordedTurnstileOptions {
  readonly action: string;
  readonly appearance: string;
  readonly execution: string;
  readonly refreshExpired: string;
  readonly refreshTimeout: string;
  readonly responseField: boolean;
  readonly responseFieldName: string;
  readonly retry: string;
  readonly sitekey: string;
  readonly size: string;
  readonly theme: string;
}

interface RecordedRequest {
  readonly audience: FormDataEntryValue | null;
  readonly credentials: RequestCredentials | undefined;
  readonly email: FormDataEntryValue | null;
  readonly method: string | undefined;
  readonly source: FormDataEntryValue | null;
  readonly turnstileResponse: FormDataEntryValue | null;
  readonly url: string;
}

interface FixtureSnapshot {
  readonly domState: string;
  readonly errors: readonly string[];
  readonly expectedEmail: string;
  readonly requests: readonly RecordedRequest[];
  readonly schema: "hraness.site-footer.browser-fixture/v1";
  readonly selectedState: FixtureState;
  readonly turnstile: Readonly<{
    readonly options: RecordedTurnstileOptions | null;
    readonly removeCount: number;
    readonly renderCount: number;
    readonly resetCount: number;
  }>;
}

declare global {
  interface Window {
    __siteFooterFixture?: Readonly<{
      snapshot: () => FixtureSnapshot;
    }>;
    turnstile?: Readonly<{
      remove: (widget: string) => void;
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      reset: (widget: string) => void;
    }>;
  }
}

function selectedFixtureState(): FixtureState {
  const state = new URL(window.location.href).searchParams.get("state") ?? "idle";
  if ((fixtureStates as readonly string[]).includes(state)) return state as FixtureState;
  throw new Error(`Unsupported site-footer fixture state: ${state}`);
}

function boundedError(value: unknown): string {
  const rendered = value instanceof Error ? `${value.name}: ${value.message}` : String(value);
  return rendered.slice(0, 512);
}

const selectedState = selectedFixtureState();
const errors: string[] = [];
const requests: RecordedRequest[] = [];
let latestTurnstileOptions: TurnstileOptions | null = null;
let renderCount = 0;
let removeCount = 0;
let resetCount = 0;

window.addEventListener("error", (event) => {
  errors.push(boundedError(event.error ?? event.message));
});
window.addEventListener("unhandledrejection", (event) => {
  errors.push(boundedError(event.reason));
});

window.turnstile = Object.freeze({
  remove(_widget: string) {
    removeCount += 1;
  },
  render(container: HTMLElement, options: TurnstileOptions) {
    renderCount += 1;
    latestTurnstileOptions = options;
    container.dataset.fixtureTurnstile = "ready";
    const marker = document.createElement("span");
    marker.hidden = true;
    marker.textContent = "Synthetic Turnstile boundary ready";
    container.replaceChildren(marker);
    queueMicrotask(() => {
      if (selectedState === "verification-error") options["error-callback"]();
      else options.callback(`fixture-token-${String(renderCount)}`);
    });
    return `fixture-widget-${String(renderCount)}`;
  },
  reset(_widget: string) {
    resetCount += 1;
    latestTurnstileOptions?.callback(`fixture-reset-token-${String(resetCount)}`);
  },
});

window.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url !== MAILING_URL) {
    throw new Error(`The footer fixture blocked an unexpected request: ${url}`);
  }
  if (!(init?.body instanceof FormData)) {
    throw new Error("The footer fixture expected one multipart FormData request.");
  }
  requests.push(Object.freeze({
    audience: init.body.get("audience"),
    credentials: init.credentials,
    email: init.body.get("email"),
    method: init.method,
    source: init.body.get("source"),
    turnstileResponse: init.body.get("cf-turnstile-response"),
    url,
  }));

  if (selectedState === "pending") {
    return await new Promise<Response>(() => undefined);
  }
  return new Response("", {
    status: selectedState === "accepted" ? 202 : 503,
  });
}) as typeof window.fetch;

function recordedTurnstileOptions(): RecordedTurnstileOptions | null {
  const options = latestTurnstileOptions;
  if (options === null) return null;
  return Object.freeze({
    action: options.action,
    appearance: options.appearance,
    execution: options.execution,
    refreshExpired: options["refresh-expired"],
    refreshTimeout: options["refresh-timeout"],
    responseField: options["response-field"],
    responseFieldName: options["response-field-name"],
    retry: options.retry,
    sitekey: options.sitekey,
    size: options.size,
    theme: options.theme,
  });
}

function readDomState(): string {
  return document.querySelector<HTMLElement>("[data-state]")?.dataset.state ?? "missing";
}

window.__siteFooterFixture = Object.freeze({
  snapshot: () => Object.freeze({
    domState: readDomState(),
    errors: Object.freeze([...errors]),
    expectedEmail: TEST_EMAIL,
    requests: Object.freeze([...requests]),
    schema: "hraness.site-footer.browser-fixture/v1" as const,
    selectedState,
    turnstile: Object.freeze({
      options: recordedTurnstileOptions(),
      removeCount,
      renderCount,
      resetCount,
    }),
  }),
});

function Fixture() {
  useEffect(() => {
    document.body.dataset.fixtureReady = "true";
    return () => {
      delete document.body.dataset.fixtureReady;
    };
  }, []);

  return (
    <>
      <main className="fixture-main">
        <article className="fixture-card">
          <p className="fixture-kicker">Package-owned browser fixture</p>
          <h1>One footer, every state.</h1>
          <p className="fixture-copy">
            This local page renders the real shared React footer against synthetic
            Turnstile and Accounts boundaries. It never contacts a live provider.
          </p>
          <p className="fixture-state">state: {selectedState}</p>
        </article>
      </main>
      <HranessSiteFooter
        mailingList={{
          audience: "footer-fixture",
          kind: "signup",
          turnstileSitekey: TURNSTILE_TEST_SITEKEY,
        }}
      />
    </>
  );
}

const root = document.querySelector("#fixture-root");
if (!(root instanceof HTMLElement)) throw new Error("The footer fixture root is missing.");
createRoot(root).render(<Fixture />);
