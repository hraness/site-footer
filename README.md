# @hraness/site-footer

The canonical Hraness network footer for every hosted Hraness website. It keeps the Ra mark, product-scoped mailing-list signup, social destinations, semantics, and responsive behavior in one organization-owned package.

Every consumer must choose its mailing-list behavior explicitly. The package never subscribes a product visitor to the general Hraness audience by default.

## React

```tsx
import { HranessSiteFooter } from "@hraness/site-footer/react";
import "@hraness/site-footer/styles.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
      <HranessSiteFooter
        mailingList={{
          audience: "soundfish",
          kind: "signup",
          turnstileSitekey: "<public Turnstile site key>",
        }}
      />
    </>
  );
}
```

On hraness.com itself, select the umbrella audience and omit the duplicate network brand:

```tsx
<HranessSiteFooter
  mailingList={{
    audience: "hraness",
    kind: "signup",
    turnstileSitekey: "<public Turnstile site key>",
  }}
  showBrand={false}
/>
```

Products without a mailing list must opt out explicitly:

```tsx
<HranessSiteFooter mailingList={{ kind: "none" }} />
```

The React adapter loads the exact Cloudflare Turnstile script once and renders a
managed, interaction-only challenge bound to `mailing_<audience>`. It does not
submit until the widget returns a short-lived proof. It shows pending state
during the request, replaces an accepted form with `Check your email to
confirm`, and retains the address with bounded retry copy after an error. The
error remains a live-region announcement while keyboard focus returns to the
email field. Any successful HTTP status is treated as accepted; provider and
validation details remain private to Accounts.

## Static HTML

```ts
import { renderHranessSiteFooter } from "@hraness/site-footer";

const html = template.replace(
  "{{HRANESS_SITE_FOOTER}}",
  renderHranessSiteFooter({
    mailingList: {
      audience: "hra",
      kind: "signup",
      turnstileSitekey: "<public Turnstile site key>",
    },
  }),
);
```

Static Hraness pages select the `hraness` audience, provide the same public
site key, and pass `showBrand: false` for the unbranded variant. Static products
without a list pass `mailingList: { kind: "none" }`.

The native form posts to the package-owned Accounts action:

```text
POST https://account.hraness.com/api/mailing/subscribe
email=<visitor address>
audience=<the consumer's explicit stable audience ID>
source=hraness-site-footer
cf-turnstile-response=<short-lived widget proof>
```

The static renderer emits Cloudflare's exact Turnstile script and an implicit
widget inside the form. Enhanced React requests render the widget explicitly,
send the same multipart form with `Accept: application/json`, and omit
credentials. Signup requires JavaScript because Accounts rejects every request
without a server-verified Turnstile proof. The footer, brand, and social links
remain meaningful without JavaScript.

## Content Security Policy

Consumers that enable signup must add `https://account.hraness.com` to their
existing `form-action` directive. Consumers using the React adapter must also
add `https://account.hraness.com` to `connect-src` for the enhanced request.
Every signup consumer must permit `https://challenges.cloudflare.com` in both
`script-src` and `frame-src`. Load the Turnstile script only from that exact
origin and do not proxy, cache, or add Subresource Integrity to it. Preserve any
other origins each site already requires when updating these directives.

The Turnstile site key is intentionally public. Use the one managed widget
whose checked hostname policy covers the six production roots. Never put its
private secret in a browser environment or footer configuration.

Include `@hraness/site-footer/styles.css` in the generated site stylesheet. Static consumers can resolve the exact installed file without assuming a `node_modules` path:

```ts
import { fileURLToPath } from "node:url";

const footerStylesPath = fileURLToPath(
  import.meta.resolve("@hraness/site-footer/styles.css"),
);
```

## Layout variables

The footer follows each site's theme variables when present. It is a persistent, full-width bottom bar with an equal flow reservation. Every rendered root has the stable `id="hraness-site-footer"` so an earlier in-page prompt can link to the canonical footer instead of duplicating signup. Signup uses a compact email-and-button row below the brand and essential social links on narrow screens, then moves into one row on wider screens. Mobile keeps X, LinkedIn, and the Hraness organization GitHub link visible; wider containers progressively reveal six, eight, and then all ten social links. Products may set `--hraness-site-footer-z-index` when coordinating layered surfaces. The form action, source, copy, social links, vectors, order, markup, and behavior stay package-owned.
