# @hraness/site-footer

Add the shared Hraness footer to a React or static website. By default it shows
the “by Hraness” home link and links to Hraness on Substack, X, LinkedIn, and
GitHub. A site can add an email signup for its own mailing list or a link to the
visitor's Hraness account, and a support link. In the React component, a cookie
note appears when the visitor's region requires consent or the region check
fails.

The package renders the markup and copy, and the static renderer and the React
component render the same initial HTML. Each site picks its mailing list, theme
colors, and security policy. `mailingList` is required and has no default
audience, so a product site's signup goes to the general Hraness list only when
the site sets `audience: "hraness"`.

## Install and first render

Pin the current immutable release:

```sh
bun add github:hraness/site-footer#v0.17.0
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
reading “by Hraness”, four specifically named social
links, and one hidden geo-gated cookie-consent note linking to the Hraness
privacy policy. The consent note stays hidden
without client-side JavaScript; after hydration the React adapter asks the
shared Accounts region endpoint whether consent applies, fails toward showing
the note when detection is unavailable, and stores acceptance in local storage.
On narrow screens, a visible note occupies its own row inside the footer; the
footer reserves both rows so page content can scroll clear of them. Acceptance
removes that row and its space. Wide footers keep the note beside the links.
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

## Configure the account or mailing-list mode

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

Add `name` to name the product in the English signup dialog. With
`name: "Soundfish"`, the dialog reads “Get Soundfish updates by email. You're
subscribed once you confirm your address.” Without it, the dialog says “Get
updates by email.” Other languages use their translated generic text.

```tsx
<HranessSiteFooter
  mailingList={{ audience: "soundfish", kind: "signup", name: "Soundfish" }}
/>
```

Hraness.com uses the shared `hraness` audience:

```tsx
<HranessSiteFooter
  attribution={measurementEligible}
  onConversion={measurementEligible ? captureFooterConversion : undefined}
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
form with “Check your email for a confirmation link.” Provider validation details remain
private to Accounts.

## Signed-in account navigation

Use `mailingList={{ kind: "account" }}` for a confirmed signed-in visitor. The
footer renders the localized “My account” native link to
`https://account.hraness.com/`, with a normal muted border and no signup form,
holographic effect, experiment assignment, exposure, token, or click tracking.
The static renderer supports the same state without JavaScript.

The host owns authentication; the footer never reads session cookies or fetches
identity. Use `none` while the initial session is unresolved or unavailable,
`account` when signed in. Hosts that show `signup` during initial or unavailable session checks should pass `attribution={false}` until signed-out status is confirmed.
These states are mutually exclusive and require no audience for account access.

```tsx
<HranessSiteFooter mailingList={{ kind: "account" }} />
```

The cookie note says cookies keep the visitor signed in only when the site
passes `signIn`. Pass it on sites that keep visitors signed in with cookies,
whatever the current `mailingList` mode; leave it out on sites without sign-in.

```tsx
<HranessSiteFooter mailingList={{ kind: "account" }} signIn />
```

During a background session refresh, a host may retain the current signup form
and pass `attribution={false}` and omit `onConversion` to preserve typed email while disabling all signup
attribution. The existing native hidden token is disabled before another event
can submit it. A successful unchanged signed-out refresh may reuse an unexpired, same-scope in-memory token. Switching to account or none aborts
pending signup work and ignores late responses. The independent cookie-consent
behavior and social links stay available in every mode.

## Optional paid support

Pass an explicit support profile to show a muted icon-only **support** link
beside the signup or account control. The link renders the bundled
question-mark vector and shares the social targets' size, muted color, and
hover treatment. Use the exact product ID accepted by Accounts; a
repository rename does not change that ID. The shared support foundation builds
the destination, with no email, token or session in its URL.

```tsx
<HranessSiteFooter
  mailingList={{ audience: "soundfish", kind: "signup" }}
  support={{
    id: "soundfish",
    name: "Soundfish",
    updates: true,
    valueProposition: "Support ongoing development of browser music tools.",
  }}
/>
```

Both renderers accept the same `support` profile. Its value proposition appears
in the link's title; its accessible name identifies optional paid membership
while the visible glyph stays the shared question icon.
The destination explains support and lets the person review current prices and
confirm payment. Navigation works without JavaScript. Rendering the link never
opens a browser, creates a session, submits signup or charges anyone.

The support link is independent of `mailingList`: it also works with `none` or
`account`. Omit `support` when the site has no appropriate support destination.
An existing newsletter stays on its explicit audience, and a product without a
public mailing list must use `updates: false` and `mailingList: { kind: "none" }`.
The footer does not infer or create a newsletter from this profile. Upgrade and
deploy each consumer to adopt this interface; publishing the package alone does
not update any website.

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

## Organization attribution

Every footer attributes the site to the organization, never to a person. The
Hraness home link is one organization-owned lockup at the start of the bar:
the Ra mark followed by the text **by Hraness**, marked `lang="en" dir="ltr"`
so it is independent of the signup locale, and keeping the accessible name
“Hraness home.”

The lockup is package-owned. Products cannot rename, reword, translate, or
reorder it, and there is no prop for a product- or person-level maker credit.
Hosts that already supply the same Hraness identity may omit the whole lockup
with `showBrand={false}`.

## Ownership boundary

| Package-owned | Consumer-owned |
| --- | --- |
| Ra mark, Hraness home destination, the “by Hraness” lockup, four social platforms, default destinations, accessible names, icon vectors, and order | Whether the host already supplies Hraness identity through `showBrand`; optional `href` and `label` overrides for owned platforms |
| Form action, field names, `source=hraness-site-footer`, copy, semantics, and response states | One stable product audience or an explicit no-mailing-list choice |
| Static and React markup, honeypot field, and the fixed Accounts action | Accounts rate limits, double opt-in, delivery, and retention |
| Responsive CSS, document-flow placement, coarse-pointer targets, focus treatment, and forced-color handling | Product theme variables and CSP `form-action`/`connect-src` allowlist |
| Configuration parsing for audience and social-override bounds | Accounts delivery configuration, provider retention, consent, and operational monitoring |

Consumers must not fork the package action, source, copy, social
platforms, vector mark, order, semantics, or interaction behavior. A product can
choose its audience, retarget owned social destinations, and set visual
variables without creating another footer contract.

## Trust and privacy boundary

With `mailingList: { kind: "none" }` or `{ kind: "account" }`, the package renders
no signup form or external script and initiates no signup or experiment request.
The shared React cookie-consent check and acceptance storage described above
remain independent of this mode.

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
At every width, one stable “Get email updates” button opens the same signup form.
React upgrades its native disclosure to a named `dialog` with synchronous email
focus, browser focus containment, Escape/dismiss return focus, and a scrollable
viewport-bounded panel. The email field uses at least 16px text and both form
controls are at least 48px tall. Without JavaScript, native details reveals the
same functional POST form. Substack always remains visible; X,
LinkedIn and GitHub appear in that order as the social group's available space permits. At and above `47.5rem` the social group grows to its four
targets before the row's flexible gap receives any width, then the
gap takes the remainder; a starved row still sheds icons in priority order.
The home link shows the Ra icon followed by “by Hraness” and
keeps the accessible name “Hraness home.”

The footer keeps matching top and bottom padding around its controls and adds
the device's safe-area inset below that spacing. Its computed height includes
both. Do not add another footer bar, viewport spacer, or blank padding after it in a
consumer layout. Product navigation belongs with the page navigation.

The `stable-modal-v1` presentation never waits for a session check, feature flag,
assignment, or telemetry. The deprecated `experiment` prop is accepted but inert.
Layout never changes after an attribution response, and the only copy that can
change is the English signup label in the test described below. Pending, retryable
error, dismissal/reopening, callback changes and attribution eligibility changes
preserve the form and its input. Generic request acceptance hides the form inside
the modal and says “Check your email for a confirmation link.” The footer button remains.

The modal uses a visible email label, neutral `you@example.com` placeholder, and
plain “Subscribe” submit. For the `hraness` audience, the benefit is new writing
and Hraness project updates. Other audiences receive neutral email-update copy;
no cadence or exclusive content is promised. Initial localized descriptions are
presubmission instructions, separate from acceptance messages.

Optional `onConversion` receives only `{ stage, presentationVersion, audience,
locale, reason? }`. Stages are `impression`, `open`, `close`, `input_started`,
`validation_failed`, `submit`, `accepted`, and `error`. Reasons are the fixed
`dismiss_button`, `escape`, `backdrop`, `invalid_email`, `required_email`,
`request_failed`, or `network_error` values. Locale comes from the finite package
catalog. No email, text length, freeform input, URL or enrollment token reaches
the callback. Exceptions are isolated. Impression requires 50% visibility for
400ms and is deduplicated; input-start is deduplicated, and duplicate pending
submissions do not create another request or event. Omit the callback whenever
measurement is ineligible. Adding/removing it never changes the UI. `accepted`
means only a generic anti-enumeration request acceptance, including suppressed
or honeypot cases; it is never a provider-delivery or confirmed-subscription event.

When `attribution` is omitted, the footer measures a browser only after cookie
consent is accepted or the region needs none, and never for browsers that send Do
Not Track or Global Privacy Control or for automated browsers. An explicit
`true` or `false` is the host's own eligibility decision. When it runs, the
footer requests an anonymous Accounts token and attaches it to native and
enhanced posts, so Accounts can count confirmed signups. Pass `attribution={false}`
to turn it off.

English visitors on the `hraness` list, or on a list whose `name` is at most 20
characters, join a signup-label test (`copy-modal-v1`). Each browser gets one of
three labels for the button and the dialog title: “Get email updates”,
“Get {name} updates” (“Get Hraness updates” on hraness.com), or “Subscribe to the
newsletter”. The label is chosen at random once, stored in `localStorage` under
`hraness-site-footer:copy-arm:v1`, and rendered before any token is requested.
Accounts must confirm that same label within 1.5 seconds, or the footer returns to
“Get email updates” with the fixed `stable-modal-v1` token for the rest of that
page. On server-rendered pages, the label changes once the footer hydrates. Everyone else always sees the fixed label.
The response never selects layout. Pending, failed and malformed
responses leave the button usable. Ineligibility immediately disables the hidden
token and aborts measurement requests. An unexpired same-origin, audience, locale
and viewport token may be reused in memory after a successful session recheck,
with a 60-second expiry margin; tokens are never persisted. A viewport change
uses fresh scoped attribution while preserving the active form. Accounts alone
records true double-opt-in confirmation through the existing challenge/outbox
path. Historical randomized presentation versions remain distinct.

The button and submit retain the shared static foil border, with optional bounded
pointer enhancement and reduced-motion/forced-color fallbacks. The email field
is quiet and separately labelled. All styling is compiled through StyleX. Native
modal custody may write only two numeric viewport custom properties and preserve
and restore the document root's overflow; it never injects a stylesheet.

Unreleased: the cookie note mentions sign-in only on sites that pass `signIn`,
and it says the browser, not a cookie, remembers the consent choice. A signup
can name its product in the English dialog through `mailingList.name`. The
accepted state reads “Check your email for a confirmation link.” Signup attribution is on
by default, skipping Do Not Track, Global Privacy Control, and automated browsers,
and English visitors join the three-label `copy-modal-v1` signup test.

Version 0.16.0 introduces the stable modal and optional bounded lifecycle observations.

### Historical releases

Version 0.15.0 moves the signup foil treatment onto the shared Hraness foil
contract from `@hraness/design-kit`: the same six-stop `--hraness-foil-*`
spectrum (with the deeper dark-mode palette), the bounded pointer inputs
`attachFooterFoil` now writes under their shared names, and a new
`--hraness-foil-surface` seam behind the legacy
`--hraness-site-footer-holo-surface` override. Pin
`github:hraness/site-footer#v0.15.0` to adopt it.

Version 0.14.0 folds the organization attribution into the home link, which now
reads the Ra mark followed by “by Hraness” in every mailing mode and at every
width, and removes the standalone attribution block and the `hranessAttribution`
export. The optional Support destination becomes a muted icon-only link that
renders the bundled question-mark vector at the shared social-target size;
its accessible name and product destination are unchanged. Pin
`github:hraness/site-footer#v0.14.0` to adopt it.

Version 0.13.0 adds the shared organization attribution: the primary line
“Built by Hraness” and the subtitle “Hraness is an advanced software research
organization dedicated to advancing the frontier of machine intelligence.”
render in both renderers and every mailing mode, exported as
`hranessAttribution`. The single-row bar, its computed height, the link
contract, and mailing, consent, and theme behavior are unchanged; the wide row
now grows the social group to four targets first and gives the attribution the
remaining width. Pin `github:hraness/site-footer#v0.13.0` to adopt it.

Version 0.10.2 makes every English placeholder explicit email guidance, keeps
the popup close to its footer, and changes the open trigger to a quiet Close
action without shifting its footprint. React focuses the email field during
opening, and compact/touch inputs use 16px text to avoid focus zoom. Native
disclosure labels and styling also work without JavaScript. Presentation
version 3 keeps these changes separate from earlier experiment results.

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

The signup controls share the Hraness foil contract with marketing surfaces:
`--hraness-foil-surface` retints the control face (the legacy
`--hraness-site-footer-holo-surface` override still wins when set). The ring
uses the metallic recipe of the marketing header wordmark: ink-toned chrome
bands from the footer foreground, with `--hraness-foil-1` through
`--hraness-foil-6` contributing only a faint reflection that
`--hraness-foil-reflection` (default 14%) scales,
and `--hraness-foil-halo-alpha` scales the resting glow. Products that import
`@hraness/design-kit` get the same palette on `.hraness-foil` surfaces for free;
the pointer position itself stays internal to the `attachFooterFoil` controller.

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
| Static markup, explicit mailing mode, organization attribution, social order, config rejection, and no-signup boundary | `bun test --preload ./scripts/register-stylex-test-transform.ts ./tests/footer.test.ts ./tests/readme.test.ts` |
| React and static parity, request fields, focus recovery, and accepted/error states | `bun test --preload ./scripts/register-stylex-test-transform.ts ./tests/react.test.tsx` |
| Responsive geometry, focus, coarse pointer, reduced motion, forced colors, exact CSS boundaries, and mutation rejection | `bun test --preload ./scripts/register-stylex-test-transform.ts ./tests/styles.test.ts` after the checked build |
| Complete compiler manifest, source recipes, runtime boundaries, CSS exports, and absence of handwritten presentation | `bun run check:stylex-artifacts` |
| Identical generated artifacts across two absolute package roots | `bun run check:stylex-determinism` |
| Real React idle, pending, accepted, and request-error states at wide and compact viewports; named alignment, containment, minimum-size, overflow, stability, browser diagnostics, exact source identity, and retained screenshots | `bun run verify:browser` after `bun run verify:browser:doctor` |
| ESM artifacts and declaration output | `bun run build` |
| Published files, public exports, server-safe root, React client directive, and packed smoke render | `bun run test:package` |
| TypeScript, generated artifacts, all tests, and package boundary | `bun run check` |

The browser verifier uses the real React adapter with a synthetic Accounts
boundary on loopback. It also requests fixed stable-modal-v1 attribution and verifies desktop/mobile
native-modal opening, trusted synchronous focus, Tab containment, Escape,
dismiss/reopen input preservation, and a short scrollable phone viewport.

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
progressively enhances the same form with modal pending, error, and
confirmation states.

</details>

<details>
<summary>When should I hide the Hraness brand?</summary>

Use `showBrand={false}` only when the host page already supplies the same
Hraness identity. Mailing configuration and
network links remain unchanged.

</details>

<details>
<summary>Can a product credit its own maker in the footer?</summary>

No. The footer attributes every site to Hraness with one shared lockup, and
there is no prop for a product or personal maker credit. Put product-specific
credits in the page content that the product owns.

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

The published footer bundles the portable support implementation and ships self-contained
profile declarations. Consumers do not install a transitive support-foundation package;
CLI products can depend directly on the foundation independently. The release gate checks that
the public profile shape matches the exact reviewed foundation version.
