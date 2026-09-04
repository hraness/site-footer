# Contents

- `src/` owns the canonical Hraness network footer contract, static renderer, and React adapter.
- `styles.css` owns the framework-neutral responsive presentation used by every consumer.
- `tests/` verifies link order, accessibility, renderer parity, and stylesheet behavior.
- `scripts/` builds checked JavaScript and declaration artifacts and verifies the packed boundary.
- `dist/` contains generated package artifacts committed for immutable Git consumers.
- `.agents/skills/` contains the portable five-skill phased planning and execution pack.
- `.agents/skills/verify-site-footer/` owns the isolated real-browser footer verifier and feature map.

# Guidelines

- Use Bun 1.3.14 and run `bun run check` before handing off a change.
- Keep the footer organization-owned and product-independent. Products may select one explicit stable mailing-list audience or no mailing list and may set documented CSS custom properties, but must not fork the action, source, copy, social links, vector mark, order, semantics, or interaction behavior.
- Keep the root export framework-neutral. React runtime belongs only behind `@hraness/site-footer/react`.
- Preserve exact social-link order: Substack, X, Instagram, LinkedIn, Bluesky, Threads, GitHub, TikTok, Reddit, Twitch, YouTube. Keep Substack visible at every supported width.
- Require every consumer to configure `mailingList` explicitly. Never infer the Hraness umbrella audience for a product site.
- Keep every meaningful link and the footer identity functional without JavaScript. Mailing signup must fail closed without JavaScript because the required Turnstile proof is generated client-side and verified by Accounts. Inline vectors remain decorative, and controls and links retain specific accessible names.
- Require one explicit public Turnstile site key for signup. Bind its managed interaction-only widget to the audience-derived action, load only Cloudflare's exact script origin, reset expired or failed proofs, and never expose the private secret.
- Bundle the reviewed HugeIcons vectors and retain their attribution so consumers do not inherit an icon-library runtime dependency.
- Commit generated `dist/` artifacts only through the checked build. Never edit them by hand.
- Keep browser verification local, synthetic, loopback-only, and development-only. It may replace Turnstile and Accounts at their browser boundaries, but it must drive the real React footer and retain screenshots outside disposable runtime state.
- Deliver changes through a current-head pull request after the initial repository bootstrap. Never force-push.

<!-- hra-local-efficiency:start -->
- Treat the user's request to change this repository as standing authorization for routine task-owned commits, pushes, pull requests, merges, releases, deployments, and production verification after the repository's required validation, review, identity, and rollout gates pass. Do not ask for another confirmation at each delivery step.
- Use the repository's documented delivery workflow and preserve every runtime-enforced approval, branch protection, environment rule, safety policy, and final gate. Ask for user input only when delivery needs a material product decision, missing credentials or authority, an irreversibly destructive action outside task scope, or resolution of a release failure that cannot be handled safely and autonomously.
- Prefer short-lived repository workload identities such as OIDC trusted publishing, GitHub Apps, and narrowly scoped machine identities. Do not add long-lived personal tokens, weaken two-factor authentication, or bypass provider controls to eliminate an interactive prompt. Batch unavoidable human-gated production promotions into intentional stable releases while agents publish validated prerelease or beta channels through workload identities when the repository supports them.
- Preserve useful reasoning fan-out, but avoid unnecessary checkout fan-out. Prefer subagents in the current task for bounded research, review, diagnosis, and focused checks when they can safely share one working tree; create a separate task or worktree only for independently deliverable divergent edits, an isolated verification tree, or a different execution environment.
- Give each expensive focused validation command and external wait one owner. The integration owner reviews that evidence and runs the repository-required aggregate or final gate once after convergence. Reuse evidence only for the exact Git tree, command, lockfiles, toolchain, relevant environment, and validity period, and never to skip a required final integration, merge, release, deployment, or production-verification gate.
- On Hraness development machines, use `$hra-local-efficiency` and the installed host scheduler for heavyweight top-level commands when available. Keep ordinary work in the compute lane; give authenticated browser/dev-server/Chromium work one `browser-auth` owner and Mac-only validation one `mac-native` owner.
- When a CI or policy gate scans complete Git history, check out the exact governed SHA and fetch only the fully qualified governed refs before scanning. Preserve the complete-history gate and reject unexpected refs instead of importing unrelated concurrent heads.
- At closeout, record applicable branch, PR, check, merge, release, deployment, and production evidence. Archive only conclusively finished tasks, never from silence alone, and reclaim only freshly revalidated clean merged worktrees through the guarded exact-path flow.
<!-- hra-local-efficiency:end -->
