---
name: verify-site-footer
description: Drive the real shared Hraness React footer through isolated synthetic signup states, responsive layout checks, and retained browser evidence. Use for package-level footer behavior or geometry verification; do not use against production Accounts or a person's browser profile.
---

# Verify the site footer

Use the package-owned verifier to exercise the real React adapter while replacing only the external Accounts browser port. Treat this as package and fixture evidence, not proof of Accounts or of a consuming website.

## Doctor

Run:

```sh
bun run verify:browser:doctor
```

Require Bun 1.3.14, `@hraness/direct` 0.7.18, agent-browser 0.32.3, the checked source tree, an unused loopback port, no active verifier ownership record, and a writable ignored evidence directory. Doctor is read-only and refuses ambiguous ownership.

## Launch

Run the complete verifier through the host browser lane:

```sh
ABSOLUTE_OOMPA_HOST_RUN --mode=exclusive --lane=browser-auth --label=site-footer-browser -- bun run verify:browser
```

Resolve `ABSOLUTE_OOMPA_HOST_RUN` with `command -v oompa-host-run` first. The verifier builds the fixture into one unique temporary directory, binds only `127.0.0.1:4187`, checks `/health`, launches one fresh contained Chromium process, and refuses to reuse another local server. It records exact server and browser ownership before driving.

## Drive

The four sequential contexts are `idle`, `pending`, `accepted`, and `error`. Each context:

1. starts with `tab new` beside the inert bootstrap tab, with the `127.0.0.1` browser allowlist already active;
2. drives the visible email field and signup button when submission is part of the state;
3. observes the exact Accounts request at the external boundary;
4. captures two settled named-layout samples at widths 1280, 390, 320, and 760 in the same context; and
5. inventories the scenario, returns to the inert bootstrap tab, closes the inactive scenario tab by stable ID, and verifies the post-close inventory.

Do not add state setters or alternate footer markup to make a run pass. Read [the signup-state map](references/features/signup-states.md) when changing state coverage and [the responsive-layout map](references/features/responsive-layout.md) when changing geometry rules.

A fifth signup context requests a synthetic version 3 inline enrollment through
the real Accounts browser port, then repeats all four widths. The wide samples
require the complete disclosure panel to match the form height and remain inside
the footer. Compact reassignment must produce the button arm. The manifest retains
the actual named rectangles and experiment requests. It then checks compact
click/keyboard opening, synchronous email focus, Close and Escape, preserved
input, a stable trigger footprint, localized accessible names, quieter open
styling, 16px input text, and an attached 4–6px popup gap at 390px and 320px.

A separate context renders the real footer with `mailingList: { kind: "none" }` at the same four widths. It checks all five link targets, no mailing UI or provider interaction, matching top and bottom visual padding plus the device safe-area inset, and visible keyboard focus through the home link and four social links.

An additional account context uses `mailingList: { kind: "account" }` with
experiments enabled to prove it sends no signup or experiment request. At all
four widths it checks the native account destination, muted border without foil,
visible keyboard focus, one row, viewport containment and priority socials.

## Evidence

The verifier retains full-page PNGs, per-state JSON, and one bounded manifest below `artifacts/site-footer/browser-verification/`. Require:

- the expected accessible state and focus destination;
- the exact synthetic request fields for submitted states and no request otherwise;
- no page errors or error/assertion-level console entries;
- exact repository source-content identity before drive, after drive, and after cleanup;
- wide brand, mailing, and social centerlines within 1 CSS pixel;
- equal input and submit heights;
- wide inline outer panel height equal to its form and complete containment inside the footer;
- an absolute hidden idle status that does not enlarge its form row;
- four social targets at wide widths and a visible priority prefix beginning with Substack at compact widths;
- an icon-only home link;
- the exact “Built by Hraness” attribution and subtitle in one row-height block at wide widths, with no compact footprint and no removal from the accessibility tree;
- positive computed top padding and bottom padding equal to that padding plus an independently measured device safe-area inset;
- actual visible content clearances matching both padding values, with the fixed footer height including both clearances, in signup and no-signup layouts;
- an in-flow footer row whose visible status surfaces clear its top edge;
- no compact horizontal overflow;
- declared minimum target sizes; and
- two-sample Direct stability with no named-layout violations.

Geometry evidence does not judge hierarchy, contrast, typography, or visual quality. Inspect the wide and compact screenshots before reporting a visual conclusion.

The spacing sample temporarily inserts an invisible, out-of-flow measurement box to resolve `env(safe-area-inset-bottom, 0px)` independently, then removes it. It does not alter the footer or its state. The normal Chromium fixture can report a zero inset; that is not physical-device or nonzero-inset emulation evidence.

## Cleanup

Normal runs close the whole verifier-owned browser, terminate the exact server process group, remove the unique temporary directory and ownership record, and preserve evidence.

After an interrupted run, inspect without mutation:

```sh
ABSOLUTE_OOMPA_HOST_RUN --mode=exclusive --lane=browser-auth --label=site-footer-cleanup -- bun run ./.agents/skills/verify-site-footer/scripts/verify.ts cleanup --dry-run
```

Apply only the validated recorded cleanup:

```sh
ABSOLUTE_OOMPA_HOST_RUN --mode=exclusive --lane=browser-auth --label=site-footer-cleanup -- bun run ./.agents/skills/verify-site-footer/scripts/verify.ts cleanup --apply
```

Resolve the same reviewed absolute scheduler path used for launch. Cleanup refuses a mismatched repository, token, exact PID command, session name, or temporary path, and revalidates PID ownership before signal escalation. The browser idle timeout is a bounded fallback, not cleanup evidence.

## Feature Map

Begin with [the feature index](references/features/README.md), then read only the feature file relevant to the requested verification.
