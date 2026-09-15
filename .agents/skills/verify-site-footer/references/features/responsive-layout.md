# Responsive layout

## Sub-features

- One aligned wide row at 1280 by 900.
- Two-row compact composition at 390 by 844.
- Constrained 320-pixel phones and the 760-pixel single-row breakpoint.
- Visible brand, mailing, and social grouping.
- One row at both widths; compact signup is a disclosure button, with Substack always visible and later socials revealed in priority order as space permits.
- Icon-only home link with an accessible name and a full control-sized target.
- Matching top and bottom visual padding, with the device safe-area inset added below it.
- Rendered control and link clearances matching the computed padding; footer height includes both clearances.
- Equal email and submit heights.
- Non-reserving idle status surface.
- Minimum visible target sizes, viewport containment, no compact overflow, and settled geometry.
- Independently cascaded control font palettes and inherited font language.
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
fail the check rather than silently skipping it. Accepted replaces the controls,
so that state requires both control samples to be absent.

## Gotchas

- The non-idle status surface intentionally overlays above the in-flow footer row. It must clear its top border rather than sit inside it.
- A passing rectangle contract does not prove typography, contrast, prominence, or rhythm. Review both screenshots.
- Fine-pointer controls are checked at the package's 40 CSS pixel baseline. The existing stylesheet test separately protects the 44 CSS pixel coarse-pointer override.
- A zero inset in the Chromium fixture proves the ordinary-screen spacing contract, not a physical mobile device or a forced nonzero inset. Retain the measured inset in the evidence.
