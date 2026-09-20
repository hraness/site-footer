# Responsive layout

## Sub-features

- One aligned wide row at 1280 by 900.
- One-row compact composition with a native disclosure at 390 by 844.
- Constrained 320-pixel phones and the 760-pixel single-row breakpoint.
- Visible brand, mailing, and social grouping.
- One row at both widths; compact signup is a disclosure button, with Substack always visible and later socials revealed in priority order as space permits.
- Organization-owned home link in every context: the Ra mark followed by the exact “by Hraness” lockup text in one `lang="en"` link, the accessible name “Hraness home,” and a control-sized target; no standalone attribution block remains.
- Matching top and bottom visual padding, with the device safe-area inset added below it.
- Rendered control and link clearances matching the computed padding; footer height includes both clearances.
- Equal email and submit heights.
- Stable trigger at all widths, with a named native modal and fixed stable-modal-v1 attribution.
- Non-reserving idle status surface.
- Minimum visible target sizes, viewport containment, no compact overflow, and settled geometry.
- Independently cascaded control font palettes and inherited font language.
- Signed-in account link at all four widths, with native navigation, normal border, no foil or signup/experiment requests, and keyboard focus.
- Signup-disabled footer at all four widths, including visible keyboard focus through its five links and no provider interactions.

## How to get to it (user POV)

Resize the same state from a desktop-sized viewport to a compact phone-sized viewport. The footer follows the page content in normal document flow; the fixture's full-height flex shell keeps it at the bottom of a short page.

## Driving it with agent-browser

The verifier samples package-named rectangles twice after two animation frames. It validates explicit Direct rules for containment, centerline alignment, selected non-overlap relationships, clipping, minimum sizes, and stability. It also reads computed footer and status positioning plus document scroll width.

Every signup state and no-signup viewport records computed top and bottom padding, the independently resolved safe-area inset, and the physical clearance between the footer edges and the outermost visible controls and links. Bottom padding must equal positive top padding plus the inset, within 0.5 CSS pixels. Both rendered clearances must match those computed paddings, and the fixed inner height must contain the rendered content, padding, and borders. This catches padding added without increasing the reserved bar height. The inset is measured with an invisible, out-of-flow box that is removed immediately; no footer styles or component state are changed.

Each viewport also records the real controls' computed font cascade. The fixture
sets the footer to the `dark` palette and `"TRK"` language. A lower-priority
canary sets both controls to `light` and `"SRB"`. The compiled `font: inherit`
expansion must preserve the child palette while replacing its language with
`"TRK"`. CSS Fonts 4 excludes `font-palette` from the shorthand's subproperties;
`font-language-override` remains a reset-only subproperty. Unsupported properties
fail the check rather than silently skipping it. Accepted hides its form; that state excludes hidden controls from visible font samples.

## Gotchas

- Request status appears in the modal flow; its geometry is independent of the footer row.
- A passing rectangle contract does not prove typography, contrast, prominence, or rhythm. Review both screenshots.
- Fine-pointer controls are checked at the package's 28 CSS pixel baseline. The existing stylesheet test separately protects the 44 CSS pixel coarse-pointer override.
- A zero inset in the Chromium fixture proves the ordinary-screen spacing contract, not a physical mobile device or a forced nonzero inset. Retain the measured inset in the evidence.

The fixed-attribution context opens the modal by click, Enter and Space. It
observes email focus during trusted activation, tests Tab containment, Close and
Escape with typed text preserved, and checks a stable trigger width and 16px
email text at 1280px, 390px and 320px. A short 320×300 viewport must contain the
scrollable dialog and permit the submit control to be reached. Unit regressions
also cover visualViewport offset/height updates, interacted eligibility toggles,
late/malformed attribution, callback churn, and duplicate submissions.

Every fixture also enables the native optional Support link. Signup samples check its exact product/source destination, value proposition, containment, minimum target and separation from the other controls. No-signup and account contexts include it in geometry and keyboard-focus coverage. All scenarios remain synthetic and never navigate to Accounts.
