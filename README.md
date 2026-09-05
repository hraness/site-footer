# @hraness/site-footer

Add the same Hraness identity, accessible network links, and optional
product-scoped email signup to a React or static website. One package owns the
markup, link order, mailing action, response states, and responsive layout.
Each product chooses its mailing audience, theme bindings, and security policy.

The framework-neutral renderer and React adapter produce the same footer
contract. A product visitor is never assigned to the general Hraness mailing
audience by default.

## Install and first render

Pin the current immutable release:

```sh
bun add github:hraness/site-footer#v0.4.6
```

Start with the network footer and no mailing form:

```tsx
import { HranessSiteFooter } from "@hraness/site-footer/react";
import "@hraness/site-footer/styles.css";

export function ProductLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <main>{children}</main>
      <HranessSiteFooter mailingList={{ kind: "none" }} />
    </>
  );
}
```

That render has the stable `id="hraness-site-footer"`, one Hraness home link
and 11 specifically named social links, and no form, Turnstile script, request,
cookie, or local storage. The links and inline decorative vectors work without
client-side JavaScript.

## Choose an interface

| Import | Use it for | Runtime boundary |
| --- | --- | --- |
| `@hraness/site-footer` | Render complete HTML into a static template or server response | Framework-neutral ESM with no React import |
| `@hraness/site-footer/react` | Render the same contract in React and progressively enhance signup states | React client component for React 18 and 19 |
| `@hraness/site-footer/styles.css` | Apply the in-flow responsive footer, theme fallbacks, and focus states | Plain CSS, imported once by the consumer |

The static interface is one function call:

```ts
import { renderHranessSiteFooter } from "@hraness/site-footer";

const footerHtml = renderHranessSiteFooter({
  mailingList: { kind: "none" },
});
```

Both renderers require `mailingList`. Both accept `showBrand: false` when the
host page already supplies the Hraness identity and an optional
`turnstileScriptNonce` when signup runs under a nonce-based Content Security
Policy.

Static generators can resolve the checked stylesheet without assuming a
`node_modules` path:

```ts
import { fileURLToPath } from "node:url";

const footerStylesPath = fileURLToPath(
  import.meta.resolve("@hraness/site-footer/styles.css"),
);
```

## Configure one mailing-list mode

Every consumer chooses one explicit mode.

Use `{ kind: "none" }` when the product has no mailing list. To enable signup,
provide a stable lowercase product audience and a public Turnstile site key:

```tsx
<HranessSiteFooter
  mailingList={{
    audience: "soundfish",
    kind: "signup",
    // Cloudflare's public test site key. Replace it before production.
    turnstileSitekey: "1x00000000000000000000AA",
  }}
/>
```

Hraness.com is the exception: its page owns the canonical Hraness Substack
signup, so keep the shared footer social-only there:

```tsx
<HranessSiteFooter
  mailingList={{ kind: "none" }}
  showBrand={false}
/>
```

Do not configure the Accounts `hraness` audience on Hraness.com. Product sites
may use an explicit product audience as shown above; the organization homepage
uses its page-owned Substack embed instead.

The configured signup follows one checked state path:

1. The footer renders a required email field, a product audience, the fixed
   package source, and an interaction-only Turnstile widget.
2. Turnstile binds its proof to `mailing_<audience>`. The React submit control
   stays disabled while verification is pending. An expired proof resets
   automatically; a genuine verification failure exposes a bounded retry that
   resets the widget before another request.
3. The enhanced React form sends one multipart `POST` with
   `credentials: "omit"` only after it has a bounded proof.
4. The button and live status move through pending, accepted, retryable request
   error, or verification error. A failed request keeps the address and returns
   keyboard focus to the email field.

The static form uses the same fields and package-owned Accounts action:

```text
POST https://account.hraness.com/api/mailing/subscribe
email=<visitor address>
audience=<the consumer's explicit stable audience ID>
source=hraness-site-footer
cf-turnstile-response=<short-lived widget proof>
```

Static HTML uses Turnstile's implicit widget. React uses explicit rendering and
sends `Accept: application/json`. A successful 2xx response replaces the form
with `Check your email to confirm`. Provider validation details remain private
to Accounts.

## Ownership boundary

| Package-owned | Consumer-owned |
| --- | --- |
| Ra mark, Hraness home destination, 11 social destinations, accessible names, icon vectors, and order | Whether the host already supplies Hraness identity through `showBrand` |
| Form action, field names, `source=hraness-site-footer`, copy, semantics, and response states | One stable product audience or an explicit no-mailing-list choice |
| Static and React markup, Turnstile action derivation, proof handling, and fixed script origins | The public site key, production hostname policy, and private Turnstile secret |
| Responsive CSS, document-flow placement, coarse-pointer targets, focus treatment, and forced-color handling | Product theme variables and CSP allowlist or nonce |
| Configuration parsing for audience, site-key, and nonce bounds | Accounts delivery configuration, provider retention, consent, and operational monitoring |

Consumers must not fork the package action, source, copy, social links, vector
mark, order, semantics, or interaction behavior. A product can choose its
audience and visual variables without creating another footer contract.

## Trust and privacy boundary

With `mailingList: { kind: "none" }`, the package renders no form or external
script and initiates no request. It does not create cookies or persistent
browser storage in either mode.

Signup changes that boundary in visible, bounded ways:

- The visitor's `email`, the consumer's `audience`,
  `source=hraness-site-footer`, and `cf-turnstile-response` are transmitted to
  `https://account.hraness.com/api/mailing/subscribe`.
- The React request uses `credentials: "omit"`. The static form performs a
  normal cross-origin form submission after Turnstile supplies the required
  field.
- The browser loads
  `https://challenges.cloudflare.com/turnstile/v0/api.js` and the provider's
  challenge frame only when signup is configured.
- The Turnstile site key is a public identifier. The package does not accept,
  expose, or validate the private Turnstile secret. Accounts owns server-side
  proof validation.
- Without JavaScript, the Hraness identity and network links still work, but
  signup fails closed because no server-verified Turnstile proof can be
  generated.

The package does not store subscriber data, deliver confirmation email,
configure consent, decide provider retention, or verify the consumer's live
hostname policy. Those responsibilities remain outside the browser package.

## Compatibility and layout

The repository uses Bun 1.3.14 and publishes ESM. The root renderer has no
framework runtime. The React adapter declares `React >=18 <20` and begins with
the required client-component directive.

The stylesheet follows `--plain-*` or common product theme variables when
present and falls back to system colors. The footer follows the page content in
normal document flow and requires no viewport overlay or matching space
reservation. Place it after the page's main content. A host that wants the
footer at the bottom of a short page can use its own full-height flex or grid
shell. A narrow signup footer uses one row for identity and essential links
plus one row for the form; at `47.5rem` it moves to one aligned row. Substack is
always the first social link; Substack, X, LinkedIn, and GitHub stay visible in
the smallest layout, with the remaining social links revealed as room becomes
available.

The CSS includes safe-area padding, visible focus outlines, 44-pixel
coarse-pointer targets, forced-color rules, and transitions only when the user
has not requested reduced motion. Container-query fallbacks keep the core
footer usable, but the repository does not claim a browser-version matrix.

## Content Security Policy

Signup consumers must merge these origins into their existing policy:

| Directive | Required origin |
| --- | --- |
| `form-action` | `https://account.hraness.com` |
| `connect-src` | `https://account.hraness.com` for the enhanced React request |
| `script-src` | `https://challenges.cloudflare.com` |
| `frame-src` | `https://challenges.cloudflare.com` |

Preserve every other origin the product already needs. Load Turnstile only from
its exact script URL. Do not proxy or cache it.

Cloudflare's current CSP guidance recommends a request-scoped nonce with CSP3
`strict-dynamic` when the host already uses nonce-based script admission. Pass
the base64 or base64url nonce through either renderer:

```tsx
<HranessSiteFooter
  mailingList={{
    audience: "soundfish",
    kind: "signup",
    turnstileSitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
  }}
  turnstileScriptNonce={nonce}
/>
```

The static renderer writes the nonce on its implicit Turnstile script. The
React adapter uses it when inserting the explicit script and reuses an existing
matching host script without replacing a host-owned nonce.

Review the current primary guidance before changing a production policy:
[Cloudflare Turnstile CSP](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)
and
[client-side rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/).

## Evidence

| Contract | Checked evidence |
| --- | --- |
| Static markup, explicit mailing mode, social order, config rejection, CSP nonce, and no-signup boundary | `bun test ./tests/footer.test.ts ./tests/readme.test.ts` |
| React and static parity, Turnstile gating, request fields, focus recovery, and accepted/error states | `bun test ./tests/react.test.tsx` |
| Responsive geometry, focus, coarse pointer, reduced motion, forced colors, and scoped selectors | `bun test ./tests/styles.test.ts` |
| Real React idle, pending, accepted, request-error, and Turnstile-error states at wide and compact viewports; named alignment, containment, minimum-size, overflow, stability, browser diagnostics, exact source identity, and retained screenshots | `bun run verify:browser` after `bun run verify:browser:doctor` |
| ESM artifacts and declaration output | `bun run build` |
| Published files, public exports, server-safe root, React client directive, and packed smoke render | `bun run test:package` |
| TypeScript, generated artifacts, all tests, and package boundary | `bun run check` |

The browser verifier uses the real React adapter with synthetic Turnstile and
Accounts boundaries on loopback. It proves the package state path and declared
geometry, but not either live provider or overall visual quality. Inspect its
wide and compact screenshots before making a design judgment.

These deterministic checks do not prove a consumer's CSP, live Turnstile
hostname policy, Accounts delivery, or provider retention. Verify those facts
in the deployed consumer and provider consoles.

Generated files in `dist/` come only from `bun run build`; do not edit them by
hand. Reviewed HugeIcons vectors retain their attribution in
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). The package is available
under the [MIT License](LICENSE).

## Questions

<details>
<summary>Do I need to enable email signup?</summary>

No. Pass `mailingList={{ kind: "none" }}`. This renders the organization
identity and social links without a form, Turnstile, or network request.

</details>

<details>
<summary>Which renderer should I use?</summary>

Use `renderHranessSiteFooter` for a static generator or framework-neutral
server template. Use `HranessSiteFooter` when a React application should
enhance pending, error, focus, and confirmation states without navigation.

</details>

<details>
<summary>Can a product change the links or subscribe copy?</summary>

No. Those values are the organization-owned contract. Configure the product
audience, brand visibility, theme variables, and CSP instead.

</details>

<details>
<summary>Why does signup require JavaScript?</summary>

Accounts accepts a signup only after server-side Turnstile verification. The
browser widget creates the short-lived proof, so a form without JavaScript
cannot satisfy that requirement.

</details>

<details>
<summary>Is the Turnstile site key a secret?</summary>

No. It is an opaque public provider value placed in rendered markup. Keep the
matching private secret in the server-side provider integration, never in a
browser environment or footer prop.

</details>

<details>
<summary>When should I hide the Hraness brand?</summary>

Use `showBrand={false}` only when the host page already supplies the same
Hraness identity. Mailing configuration and network links remain unchanged.

</details>

<details>
<summary>Where do I report a problem?</summary>

Open an issue in the
[`hraness/site-footer` repository](https://github.com/hraness/site-footer/issues)
with the package release, renderer, mailing mode, and reproducible output.

</details>

## Verify a checkout

To add the footer now, install the pinned release and begin with
`mailingList={{ kind: "none" }}`. Enable signup only after the product audience,
public site key, hostname policy, Accounts route, and CSP are ready.

For a source checkout, install the frozen dependency graph and run the complete
repository gate:

```sh
bun install --frozen-lockfile
bun run check
```
