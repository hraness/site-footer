# Responsive layout

## Sub-features

- One aligned wide row at 1280 by 900.
- Two-row compact composition at 390 by 844.
- Visible brand, mailing, and social grouping.
- First-position Substack target visible at both widths.
- Equal email and submit heights.
- Non-reserving idle status surface.
- Minimum visible target sizes, viewport containment, no compact overflow, and settled geometry.

## How to get to it (user POV)

Resize the same state from a desktop-sized viewport to a compact phone-sized viewport. The footer follows the page content in normal document flow; the fixture's full-height flex shell keeps it at the bottom of a short page.

## Driving it with agent-browser

The verifier samples package-named rectangles twice after two animation frames. It validates explicit Direct rules for containment, centerline alignment, selected non-overlap relationships, clipping, minimum sizes, and stability. It also reads computed footer and status positioning plus document scroll width.

## Gotchas

- The non-idle status and Turnstile surfaces intentionally overlay above the in-flow footer row. They must clear its top border rather than sit inside it.
- A passing rectangle contract does not prove typography, contrast, prominence, or rhythm. Review both screenshots.
- Fine-pointer controls are checked at the package's 40 CSS pixel baseline. The existing stylesheet test separately protects the 44 CSS pixel coarse-pointer override.
