# Contents

- `src/` owns the canonical Hraness network footer contract, static renderer, and React adapter.
- `styles.css` owns the framework-neutral responsive presentation used by every consumer.
- `tests/` verifies link order, accessibility, renderer parity, and stylesheet behavior.
- `scripts/` builds checked JavaScript and declaration artifacts and verifies the packed boundary.
- `dist/` contains generated package artifacts committed for immutable Git consumers.
- `.agents/skills/` contains the portable five-skill phased planning and execution pack.

# Guidelines

- Use Bun 1.3.14 and run `bun run check` before handing off a change.
- Keep the footer organization-owned and product-independent. Products may select one explicit stable mailing-list audience or no mailing list and may set documented CSS custom properties, but must not fork the action, source, copy, social links, vector mark, order, semantics, or interaction behavior.
- Keep the root export framework-neutral. React runtime belongs only behind `@hraness/site-footer/react`.
- Preserve exact social-link order: X, Instagram, LinkedIn, Bluesky, Threads, GitHub, TikTok, Reddit, Twitch, YouTube.
- Require every consumer to configure `mailingList` explicitly. Never infer the Hraness umbrella audience for a product site.
- Keep every meaningful link and the footer identity functional without JavaScript. Mailing signup must fail closed without JavaScript because the required Turnstile proof is generated client-side and verified by Accounts. Inline vectors remain decorative, and controls and links retain specific accessible names.
- Require one explicit public Turnstile site key for signup. Bind its managed interaction-only widget to the audience-derived action, load only Cloudflare's exact script origin, reset expired or failed proofs, and never expose the private secret.
- Bundle the reviewed HugeIcons vectors and retain their attribution so consumers do not inherit an icon-library runtime dependency.
- Commit generated `dist/` artifacts only through the checked build. Never edit them by hand.
- Deliver changes through a current-head pull request after the initial repository bootstrap. Never force-push.
