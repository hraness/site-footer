import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import { HranessSiteFooter } from "../../../../src/react.js";
import "../../../../styles.css";
import "./fixture.css";

const EXPERIMENT_URL = "https://account.hraness.com/api/mailing/experiment";
const MAILING_URL = "https://account.hraness.com/api/mailing/subscribe";
const CONSENT_REGION_URL = "https://account.hraness.com/api/consent/region";
const TEST_EMAIL = "footer-fixture@example.test";

const fixtureStates = [
  "idle",
  "pending",
  "accepted",
  "error",
] as const;

type FixtureState = typeof fixtureStates[number];

interface RecordedRequest {
  readonly audience: FormDataEntryValue | null;
  readonly credentials: RequestCredentials | undefined;
  readonly email: FormDataEntryValue | null;
  readonly honeypot: FormDataEntryValue | null;
  readonly method: string | undefined;
  readonly source: FormDataEntryValue | null;
  readonly url: string;
}

interface FixtureSnapshot {
  readonly domState: string;
  readonly errors: readonly string[];
  readonly expectedEmail: string;
  readonly requests: readonly RecordedRequest[];
  readonly schema: "hraness.site-footer.browser-fixture/v1";
  readonly selectedState: FixtureState;
}

declare global {
  interface Window {
    __siteFooterFixture?: Readonly<{
      snapshot: () => FixtureSnapshot;
      experimentSnapshot: () => readonly unknown[];
      disclosureSnapshot: () => readonly unknown[];
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
const pageParams = new URL(window.location.href).searchParams;
const accountEnabled = pageParams.get("mailing") === "account";
const signupEnabled = !accountEnabled && pageParams.get("mailing") !== "none";
const consentRequired = pageParams.get("consent") === "required";
const experimentEnabled = pageParams.get("attribution") === "stable";
const experimentRequests: unknown[] = [];
const errors: string[] = [];
const requests: RecordedRequest[] = [];
const disclosureActivations: unknown[] = [];

// Observe focus before the activation event returns, not after a timer/frame.
document.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  const summary = event.target.closest('[data-slot="hraness-mailing-disclosure"] > summary');
  if (summary === null) return;
  disclosureActivations.push({
    open: summary.parentElement?.hasAttribute("open"),
    emailFocused: document.activeElement?.matches('input[name="email"]') === true,
    trusted: event.isTrusted,
  });
});

window.addEventListener("error", (event) => {
  errors.push(boundedError(event.error ?? event.message));
});
window.addEventListener("unhandledrejection", (event) => {
  errors.push(boundedError(event.reason));
});

window.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url === CONSENT_REGION_URL) {
    return Response.json({ region: null, required: consentRequired });
  }
  if (url === EXPERIMENT_URL && experimentEnabled) {
    const body: unknown = JSON.parse(String(init?.body));
    if (!body || typeof body !== "object" || Array.isArray(body)
      || init?.method !== "POST" || init.credentials !== "omit") throw new Error("Invalid synthetic experiment request.");
    const request = body as Record<string, unknown>;
    experimentRequests.push(body);
    if (request.action === "expose" && request.token === "a".repeat(64)) return new Response(null, { status: 202 });
    if (request.action !== "assign" || request.audience !== "footer-fixture" || request.locale !== "en"
      || request.presentationVersion !== "stable-modal-v1" || (request.viewport !== "wide" && request.viewport !== "compact")) {
      throw new Error("The fixture requires an explicit fixed stable-modal-v1 attribution.");
    }
    return Response.json({ version: 1, token: "a".repeat(64), expiresAt: Date.now() + 48 * 60 * 60 * 1000, assignment: {
      id: "123e4567-e89b-42d3-a456-426614174000", locale: "en",
      layout: "button", copyStyle: "direct",
      color: "green", shimmer: false, cohort: "fixed", policyVersion: "stable-modal-v1", viewport: request.viewport,
    } });
  }
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
    honeypot: init.body.get("website"),
    method: init.method,
    source: init.body.get("source"),
    url,
  }));

  if (selectedState === "pending") {
    return await new Promise<Response>(() => undefined);
  }
  return new Response("", {
    status: selectedState === "accepted" ? 202 : 503,
  });
}) as typeof window.fetch;

function readDomState(): string {
  return document.querySelector<HTMLElement>("[data-state]")?.dataset.state ?? "missing";
}

window.__siteFooterFixture = Object.freeze({
  disclosureSnapshot: () => Object.freeze([...disclosureActivations]),
  experimentSnapshot: () => Object.freeze([...experimentRequests]),
  snapshot: () => Object.freeze({
    domState: readDomState(),
    errors: Object.freeze([...errors]),
    expectedEmail: TEST_EMAIL,
    requests: Object.freeze([...requests]),
    schema: "hraness.site-footer.browser-fixture/v1" as const,
    selectedState,
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
            This local page renders the real shared React footer against a
            synthetic Accounts boundary. It never contacts a live provider.
          </p>
          <p className="fixture-state">state: {selectedState}</p>
        </article>
      </main>
      <HranessSiteFooter
        // Keep the verifier's page shell in normal flow; production consumers
        // use the default sticky placement.
        placement="flow"
        attribution={experimentEnabled}
        locale="en"
        support={{ id: "soundfish", name: "Soundfish", updates: true,
          valueProposition: "Support ongoing development of browser music tools." }}
        mailingList={accountEnabled ? { kind: "account" } : signupEnabled ? {
          audience: "footer-fixture",
          kind: "signup",
        } : { kind: "none" }}
      />
    </>
  );
}

const root = document.querySelector("#fixture-root");
if (!(root instanceof HTMLElement)) throw new Error("The footer fixture root is missing.");
createRoot(root).render(<Fixture />);
