# Scope

- This skill drives only the repository-owned synthetic footer fixture on loopback.
- Keep credentials, personal browser state, production hosts, and live provider requests out of every run.
- Preserve screenshots and JSON evidence under the ignored `artifacts/` tree; remove only the exact runtime recorded by the verifier.
- The fixture may substitute Turnstile and Accounts at their browser boundaries. It must render and drive `HranessSiteFooter` from `src/react.tsx` rather than a copied UI.
- Keep Direct and agent-browser development-only. Never import verifier code from `src/` or include it in the published package files.
