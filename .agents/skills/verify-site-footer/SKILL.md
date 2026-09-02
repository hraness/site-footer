---
name: verify-site-footer
description: Drive the real shared Hraness React footer through isolated synthetic signup states, responsive layout checks, and retained browser evidence. Use for package-level footer behavior or geometry verification; do not use against production Accounts, live Turnstile, or a person's browser profile.
---

# Verify the site footer

Use the package-owned verifier to exercise the real React adapter while replacing only the external Turnstile and Accounts browser ports. Treat this as package and fixture evidence, not proof of either provider or of a consuming website.

## Doctor

Run:

```sh
bun run verify:browser:doctor
```

Require Bun 1.3.14, `@hraness/direct` 0.7.18, agent-browser 0.32.3, the checked source tree, an unused loopback port, no active verifier ownership record, and a writable ignored evidence directory. Doctor is read-only and refuses ambiguous ownership.

## Launch

Run the complete verifier through the host browser lane:

```sh
ABSOLUTE_HRA_HOST_RUN --mode=exclusive --lane=browser-auth --label=site-footer-browser -- bun run verify:browser
```

Resolve `ABSOLUTE_HRA_HOST_RUN` with `command -v hra-host-run` first. The verifier builds the fixture into one unique temporary directory, binds only `127.0.0.1:4187`, checks `/health`, launches one fresh contained Chromium process, and refuses to reuse another local server. It records exact server and browser ownership before driving.

## Drive

The five sequential contexts are `idle`, `pending`, `accepted`, `error`, and `verification-error`. Each context:

1. starts with `tab new` beside the inert bootstrap tab, with the `127.0.0.1` browser allowlist already active;
2. drives the visible email field and Subscribe button when submission is part of the state;
3. observes the deterministic Turnstile adapter and exact Accounts request at the external boundary;
4. captures two settled named-layout samples at 1280 by 900 and then 390 by 844 in the same context; and
5. inventories the scenario, returns to the inert bootstrap tab, closes the inactive scenario tab by stable ID, and verifies the post-close inventory.

Do not add state setters or alternate footer markup to make a run pass. Read [the signup-state map](references/features/signup-states.md) when changing state coverage and [the responsive-layout map](references/features/responsive-layout.md) when changing geometry rules.

## Evidence

The verifier retains full-page PNGs, per-state JSON, and one bounded manifest below `artifacts/site-footer/browser-verification/`. Require:

- the expected accessible state and focus destination;
- the exact synthetic request fields for submitted states and no request otherwise;
- no page errors or error/assertion-level console entries;
- exact repository source-content identity before drive, after drive, and after cleanup;
- wide brand, mailing, and social centerlines within 1 CSS pixel;
- equal input and submit heights;
- an absolute hidden idle status that does not enlarge its form row;
- a first-position Substack target visible at wide and compact widths;
- visible status surfaces that clear the fixed bar's top edge;
- no compact horizontal overflow;
- declared minimum target sizes; and
- two-sample Direct stability with no named-layout violations.

Geometry evidence does not judge hierarchy, contrast, typography, or visual quality. Inspect the wide and compact screenshots before reporting a visual conclusion.

## Cleanup

Normal runs close the whole verifier-owned browser, terminate the exact server process group, remove the unique temporary directory and ownership record, and preserve evidence.

After an interrupted run, inspect without mutation:

```sh
ABSOLUTE_HRA_HOST_RUN --mode=exclusive --lane=browser-auth --label=site-footer-cleanup -- bun run ./.agents/skills/verify-site-footer/scripts/verify.ts cleanup --dry-run
```

Apply only the validated recorded cleanup:

```sh
ABSOLUTE_HRA_HOST_RUN --mode=exclusive --lane=browser-auth --label=site-footer-cleanup -- bun run ./.agents/skills/verify-site-footer/scripts/verify.ts cleanup --apply
```

Resolve the same reviewed absolute scheduler path used for launch. Cleanup refuses a mismatched repository, token, exact PID command, session name, or temporary path, and revalidates PID ownership before signal escalation. The browser idle timeout is a bounded fallback, not cleanup evidence.

## Feature Map

Begin with [the feature index](references/features/README.md), then read only the feature file relevant to the requested verification.
