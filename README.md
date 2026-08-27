# @hraness/site-footer

The canonical Hraness network footer for every hosted Hraness website. It keeps the Ra mark, newsletter entry, social destinations, link order, semantics, and responsive behavior in one organization-owned package.

## React

```tsx
import { HranessSiteFooter } from "@hraness/site-footer/react";
import "@hraness/site-footer/styles.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
      <HranessSiteFooter />
    </>
  );
}
```

## Static HTML

```ts
import { renderHranessSiteFooter } from "@hraness/site-footer";

const html = template.replace("{{HRANESS_SITE_FOOTER}}", renderHranessSiteFooter());
```

Include `@hraness/site-footer/styles.css` in the generated site stylesheet. Static consumers can resolve the exact installed file without assuming a `node_modules` path:

```ts
import { fileURLToPath } from "node:url";

const footerStylesPath = fileURLToPath(
  import.meta.resolve("@hraness/site-footer/styles.css"),
);
```

## Layout variables

The footer follows each site's theme variables when present. It is a persistent, full-width bottom bar with enough flow space to keep the end of the page readable. Mobile shows the Hraness brand, newsletter, and X. Wider containers progressively reveal six, eight, and then all ten social links in one row. Products may set `--hraness-site-footer-z-index` when coordinating layered surfaces. The shared links, vectors, order, markup, and behavior stay package-owned.
