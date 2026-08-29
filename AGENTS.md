# Contents

- `src/` owns the canonical Hraness network footer contract, static renderer, and React adapter.
- `styles.css` owns the framework-neutral responsive presentation used by every consumer.
- `tests/` verifies link order, accessibility, renderer parity, and stylesheet behavior.
- `scripts/` builds checked JavaScript and declaration artifacts and verifies the packed boundary.
- `dist/` contains generated package artifacts committed for immutable Git consumers.
- `.agents/skills/` contains the portable five-skill phased planning and execution pack.

# Guidelines

- Use Bun 1.3.14 and run `bun run check` before handing off a change.
- Keep the footer organization-owned and product-independent. Products may set documented CSS custom properties, but must not fork its links, vector mark, order, semantics, or interaction behavior.
- Keep the root export framework-neutral. React runtime belongs only behind `@hraness/site-footer/react`.
- Preserve exact link order: newsletter, X, Instagram, LinkedIn, Bluesky, Threads, GitHub, TikTok, Reddit, Twitch, YouTube.
- Keep all meaningful links accessible without JavaScript. Inline vectors must remain decorative and links must retain specific accessible names.
- Bundle the reviewed HugeIcons vectors and retain their attribution so consumers do not inherit an icon-library runtime dependency.
- Commit generated `dist/` artifacts only through the checked build. Never edit them by hand.
- Deliver changes through a current-head pull request after the initial repository bootstrap. Never force-push.
