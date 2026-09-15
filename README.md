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
bun add github:hraness/site-footer#v0.10.1
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

That render has the stable `id="hraness-site-footer"`, one Hraness home link,
four specifically named social links, and one hidden geo-gated cookie-consent
note linking to the Hraness privacy policy. The consent note stays hidden
without client-side JavaScript; after hydration the React adapter asks the
shared Accounts region endpoint whether consent applies, fails toward showing
the note when detection is unavailable, and stores acceptance in local storage.
The first render issues no request, sets no cookie, and writes no local
storage. The links and inline decorative vectors work without client-side
JavaScript.

## Choose an interface

| Import | Use it for | Runtime boundary |
| --- | --- | --- |
| `@hraness/site-footer` | Render complete HTML into a static template or server response | Framework-neutral ESM with no React import |
| `@hraness/site-footer/react` | Render the same contract in React and progressively enhance signup states | React client component for React 18 and 19 |
| `@hraness/site-footer/styles.css` | Apply the sticky responsive footer, theme fallbacks, and focus states | Compatibility import of checked atomic CSS, imported once by the consumer |
| `@hraness/site-footer/stylex.css` | Resolve or copy the complete standalone stylesheet | Generated CSS with finite package priority layers |
| `@hraness/site-footer/stylex-manifest.json` | Admit the package to the shared StyleX build pipeline | Verified rules, compiler identity, and runtime and stylesheet hashes |
| `@hraness/site-footer/compiler-foundation.css` | Supply the foundation when a consumer combines package rules | Empty foundation; all footer presentation comes from the manifest |

The static interface is one function call:

```ts
import { renderHranessSiteFooter } from "@hraness/site-footer";

const footerHtml = renderHranessSiteFooter({
  mailingList: { kind: "none" },
});
```

Both renderers require `mailingList`. Both accept `showBrand: false` when the
host page already supplies the Hraness identity and an optional `social` object
that retargets owned destinations.

Static generators can resolve the checked stylesheet without assuming a
`node_modules` path:

```ts
import { fileURLToPath } from "node:url";

const footerStylesPath = fileURLToPath(
  import.meta.resolve("@hraness/site-footer/stylex.css"),
);
```

Use the standalone path when reading or copying the complete CSS into a static
site. A bundler resolves the compatibility stylesheet's relative import. If you
copy that compatibility file itself, retain its sibling `dist/stylex.css` path.
No consumer compiler or React runtime is required by the static renderer.

## Configure one mailing-list mode

Every consumer chooses one explicit mode.

Use `{ kind: "none" }` when the product has no mailing list. To enable signup,
provide a stable lowercase product audience:

```tsx
<HranessSiteFooter
  mailingList={{
    audience: "soundfish",
    kind: "signup",
  }}
/>
```

Hraness.com uses the same shared `hraness` audience and experiment:

```tsx
<HranessSiteFooter
  experiment
  mailingList={{ audience: "hraness", kind: "signup" }}
  showBrand={false}
/>
```

The configured signup follows one checked state path:

1. The footer renders a required email field, a product audience, the fixed
   package source, and a hidden honeypot field that Accounts checks and
   silently discards when filled.
2. The enhanced React form sends one multipart `POST` with
   `credentials: "omit"`. The plain form performs a normal cross-origin
   submission, so signup also works without JavaScript.
3. The button and live status move through pending, accepted, or a retryable
   request error. A failed request keeps the address and returns keyboard
   focus to the email field.

Accounts applies rate limiting and double opt-in; the visitor is only
subscribed after confirming the emailed link.

The static form uses the same fields and package-owned Accounts action:

```text
POST https://account.hraness.com/api/mailing/subscribe
email=<visitor address>
audience=<the consumer's explicit stable audience ID>
source=hraness-site-footer
website=<empty honeypot; Accounts ignores the request when filled>
```

React sends `Accept: application/json`. A successful 2xx response replaces the
form with `Check your email to confirm`. Provider validation details remain
private to Accounts.

## Retarget owned social destinations

The package owns the platform set and order: Substack, X, LinkedIn, and
GitHub. Defaults stay the shared Hraness destinations. A product may override
`href` and the matching accessible `label` for those platforms only. It cannot
add platforms, hide one, reorder icons, or change markup or CSS.

AI Charts keeps Substack and LinkedIn on the shared Hraness profiles and
retargets X and GitHub:

```tsx
<HranessSiteFooter
  mailingList={{ kind: "none" }}
  social={{
    x: {
      href: "https://x.com/aichartsio",
      label: "AI Charts on X",
    },
    github: {
      href: "https://github.com/hraness/aicharts",
      label: "AI Charts on GitHub",
    },
  }}
/>
```

Other products omit `social` and keep `https://x.com/hraness` and
`https://github.com/hraness`. The default LinkedIn destination is the Hraness
company page, `https://www.linkedin.com/company/hraness`, with the accessible
name “Hraness on LinkedIn.”

## Ownership boundary

| Package-owned | Consumer-owned |
| --- | --- |
| Ra mark, Hraness home destination, four social platforms, default destinations, accessible names, icon vectors, and order | Whether the host already supplies Hraness identity through `showBrand`; optional `href` and `label` overrides for owned platforms |
| Form action, field names, `source=hraness-site-footer`, copy, semantics, and response states | One stable product audience or an explicit no-mailing-list choice |
| Static and React markup, honeypot field, and the fixed Accounts action | Accounts rate limits, double opt-in, delivery, and retention |
| Responsive CSS, document-flow placement, coarse-pointer targets, focus treatment, and forced-color handling | Product theme variables and CSP `form-action`/`connect-src` allowlist |
| Configuration parsing for audience and social-override bounds | Accounts delivery configuration, provider retention, consent, and operational monitoring |

Consumers must not fork the package action, source, copy, social platforms,
vector mark, order, semantics, or interaction behavior. A product can choose
its audience, retarget owned social destinations, and set visual variables
without creating another footer contract.

## Trust and privacy boundary

With `mailingList: { kind: "none" }`, the package renders no form or external
script and initiates no request. It does not create cookies or persistent
browser storage in either mode.

Signup changes that boundary in visible, bounded ways:

- The visitor's `email`, the consumer's `audience`,
  `source=hraness-site-footer`, and the empty `website` honeypot field are
  transmitted to `https://account.hraness.com/api/mailing/subscribe`.
- The React request uses `credentials: "omit"`. The static form performs a
  normal cross-origin form submission.
- The package loads no third-party script or frame in either mode.
- Without JavaScript, the Hraness identity, network links, and signup form all
  still work; Accounts rate limiting and double opt-in apply identically.

The package does not store subscriber data, deliver confirmation email,
configure consent, decide provider retention, or verify the consumer's live
hostname policy. Those responsibilities remain outside the browser package.

## Compatibility and layout

The repository uses Bun 1.3.14 and publishes ESM. The root renderer has no
framework runtime. The React adapter declares `React >=18 <20` and begins with
the required client-component directive.

The stylesheet follows `--plain-*` or common product theme variables when
present and falls back to system colors. The footer is sticky by default and reserves its own document footprint, so
content is not obscured. Pass `placement="flow"` for a host that owns a full-height
layout and wants normal document flow. The signup footer always uses one aligned row.
Below `47.5rem`, every recipe presents a compact native disclosure button; opening
it reveals the email form above the bar. At wider widths the layout experiment
selects that button or an inline form. Substack always remains visible; X,
LinkedIn and GitHub appear in that order as the social group's available space permits. The home link shows only the Ra icon and
keeps the accessible name “Hraness home.”

The footer keeps matching top and bottom padding around its controls and adds
the device's safe-area inset below that spacing. Its computed height includes
both. Do not add another footer bar, viewport spacer, or blank padding after it in a
consumer layout. Product navigation belongs with the page navigation.

The React adapter requests a short-lived Accounts enrollment and exposes it
only after the visible footer settles. Presentation version 2 isolates compact and
wide cohorts: compact assignments always use the button and are never counted
as inline exposures. Crossing the breakpoint invalidates attribution; active
email text is preserved. The native form carries the same eligible enrollment
capability as enhanced submission. Version 2 tests copy and wide-screen layout;
its holographic treatment is fixed (`color: green`, `shimmer: false`) so cosmetic
arms do not dilute the results. Legacy recipes retain bounded color and shimmer
support. Accounts keeps a randomized exploration stream and
serves an evidence-qualified recipe to the remaining traffic; PostHog receives
only anonymous enrollment events and confirmed double-opt-in conversions.

English copy tests six stable, deliberately different paired hypotheses: “Send me
things” / “your inbox, but weirder”; “I'm curious” / “where should the plot thicken?”;
“Feed the goblin” / “goblin delivery address”; “Beam me up” / “earthling@probably.earth”;
“Push the button” / “put the internet in here”; and “Let me in” / “your secret inbox lair”.
Other locales retain their two localized styles. Programmatic labels still say
email signup, independently of the playful visible copy.

The CTA has a static holographic border in both renderers. React adds a
pointer-following glint for fine mouse hover, with one coalesced animation frame
per pointer update and no idle loop, filters, canvas or React rerenders. Reduced
motion, coarse pointers and forced colors disable this enhancement.

Version 0.10.1 fixes the desktop inline panel's logical padding reset so its
opaque surface stays within the single footer row. The browser gate measures
that outer panel for both the default recipe and a version 2 assignment.
Version 0.9.1 halves the footer's resting height: a 1.75rem control row,
28px fine-pointer social targets (44px stays for coarse pointers), smaller
icons, tighter padding, and an 0.875rem text size.
Version 0.9.0 removes the Cloudflare Turnstile widget, site-key
configuration, and script injection; signup relies on Accounts rate limiting,
a hidden honeypot field, and double opt-in, and now works without JavaScript.
Version 0.8.0 adds the sticky, localized signup experiment. React consumers
request an opaque Accounts assignment, while static consumers can select a
bounded recipe explicitly; the assignment is fail-closed until the Accounts
provider binding is enabled. Version 0.7.0 removes Bluesky from the shared contract, including the exported
`HranessSocialPlatform` type, adds the optional `social` override, and points
LinkedIn at `https://www.linkedin.com/company/hraness`. Version 0.6.0 removed
Instagram, Threads, TikTok, Reddit, Twitch, and YouTube.
Update each consumer's immutable Git pin and lockfile, run its required checks,
and deploy it to apply this change. Existing deployments do not change when a
new package tag is published.

The CSS includes safe-area padding, visible focus outlines, 44-pixel
coarse-pointer targets, forced-color rules, and transitions only when the user
has not requested reduced motion. Container-query fallbacks keep the core
footer usable, but the repository does not claim a browser-version matrix.

Both renderers apply the same checked StyleX recipes from `src/footer.stylex.ts`.
Stable `hraness-site-footer` and `hraness-site-footer__*` classes remain DOM hooks;
the generated `x*` classes are private build output. Products can override
`--hraness-site-footer-foreground`, `--hraness-site-footer-muted`,
`--hraness-site-footer-line`, `--hraness-site-footer-focus`,
`--hraness-site-footer-background`, `--hraness-site-footer-field-background`,
`--hraness-site-footer-action-background`, and
`--hraness-site-footer-action-foreground` on the footer hook in their own CSS.
Existing `--plain-*`, common theme variables, and footer sizing properties retain
their meanings. Keep values compatible with their original color or length type.

Package builds use the published `@hraness/ui/stylex-build` compiler at v0.5.12
with StyleX 0.19.0, collect static and React entrypoints serially, and seal their
combined rules once. Standard consumers import the standalone CSS once. A
consumer using the shared compiler admits the manifest and foundation and
serializes the admitted package rules together with its application rules.
The compiler foundation does not import standalone CSS, so that path does not
duplicate independently serialized recipe layers.

Version 0.6.3 rebuilds the existing recipes with the compiler's fail-fast
property-validation contract. Unsupported properties fail compilation rather
than silently losing declarations. Compiler consumers must register compatible
package manifests and start a fresh generation after changing compiler identity.
The prior rollback pair is Footer v0.6.2 with UI v0.5.3. Standalone static
consumers still need neither React nor the compiler at runtime; this update adds
no runtime or peer dependency.

## Content Security Policy

Signup consumers must merge these origins into their existing policy:

| Directive | Required origin |
| --- | --- |
| `form-action` | `https://account.hraness.com` |
| `connect-src` | `https://account.hraness.com` for the enhanced React request |

Preserve every other origin the product already needs. The package renders no
third-party script or frame, so no script or frame admission is required for
signup.

## Evidence

| Contract | Checked evidence |
| --- | --- |
| Static markup, explicit mailing mode, social order, config rejection, and no-signup boundary | `bun test --preload ./scripts/register-stylex-test-transform.ts ./tests/footer.test.ts ./tests/readme.test.ts` |
| React and static parity, request fields, focus recovery, and accepted/error states | `bun test --preload ./scripts/register-stylex-test-transform.ts ./tests/react.test.tsx` |
| Responsive geometry, focus, coarse pointer, reduced motion, forced colors, exact CSS boundaries, and mutation rejection | `bun test --preload ./scripts/register-stylex-test-transform.ts ./tests/styles.test.ts` after the checked build |
| Complete compiler manifest, source recipes, runtime boundaries, CSS exports, and absence of handwritten presentation | `bun run check:stylex-artifacts` |
| Identical generated artifacts across two absolute package roots | `bun run check:stylex-determinism` |
| Real React idle, pending, accepted, and request-error states at wide and compact viewports; named alignment, containment, minimum-size, overflow, stability, browser diagnostics, exact source identity, and retained screenshots | `bun run verify:browser` after `bun run verify:browser:doctor` |
| ESM artifacts and declaration output | `bun run build` |
| Published files, public exports, server-safe root, React client directive, and packed smoke render | `bun run test:package` |
| TypeScript, generated artifacts, all tests, and package boundary | `bun run check` |

The browser verifier uses the real React adapter with a synthetic Accounts
boundary on loopback. It also requests a version 2 inline enrollment and checks
that the entire desktop disclosure panel matches the form height and remains
inside the footer, including the 760px breakpoint. It proves the package state path and declared
geometry, but not either live provider or overall visual quality. Inspect its
wide and compact screenshots before making a design judgment.
It compiles the real source with the same public collector and checks every
extracted rule against the verified package manifest before launching a browser.

These deterministic checks do not prove a consumer's CSP, Accounts delivery,
or provider retention. Verify those facts
in the deployed consumer and provider consoles.

Generated files in `dist/` come only from `bun run build`; do not edit them by
hand. Reviewed HugeIcons vectors retain their attribution in
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). The package is available
under the [MIT License](LICENSE).

## Questions

<details>
<summary>Do I need to enable email signup?</summary>

No. Pass `mailingList={{ kind: "none" }}`. This renders the organization
identity and social links without a form or network request.

</details>

<details>
<summary>Which renderer should I use?</summary>

Use `renderHranessSiteFooter` for a static generator or framework-neutral
server template. Use `HranessSiteFooter` when a React application should
enhance pending, error, focus, and confirmation states without navigation.

</details>

<details>
<summary>Can a product change the links or subscribe copy?</summary>

Subscribe copy, platform set, icon order, and markup stay package-owned. A
product may retarget `href` and `label` for Substack, X, LinkedIn, or GitHub
through `social`. Configure the product audience, brand visibility, theme
variables, and CSP for everything else.

</details>

<details>
<summary>Does signup work without JavaScript?</summary>

Yes. The plain form posts directly to Accounts, which applies rate limiting
and double opt-in and redirects to a confirmation page. The React adapter
progressively enhances the same form with inline pending, error, and
confirmation states.

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
`mailingList={{ kind: "none" }}`. Enable signup after the product audience,
Accounts route, and CSP `form-action`/`connect-src` entries are ready.

For a source checkout, install the frozen dependency graph and run the complete
repository gate:

```sh
bun install --frozen-lockfile
bun run check
```
