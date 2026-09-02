# Responsive layout

## Sub-features

- One aligned wide row at 1280 by 900.
- Two-row compact composition at 390 by 844.
- Visible brand, mailing, and social grouping.
- Equal email and submit heights.
- Non-reserving idle status surface.
- Minimum visible target sizes, viewport containment, no compact overflow, and settled geometry.

## How to get to it (user POV)

Resize the same state from a desktop-sized viewport to a compact phone-sized viewport. The footer remains fixed at the viewport bottom while its root reserves matching document flow.

## Driving it with agent-browser

The verifier samples package-named rectangles twice after two animation frames. It validates explicit Direct rules for containment, centerline alignment, selected non-overlap relationships, clipping, minimum sizes, and stability. It also reads computed status positioning and document scroll width.

## Gotchas

- The non-idle status and Turnstile surfaces intentionally overlay above the fixed bar; do not require them to be inside the bar rectangle.
- A passing rectangle contract does not prove typography, contrast, prominence, or rhythm. Review both screenshots.
- Fine-pointer controls are checked at the package's 40 CSS pixel baseline. The existing stylesheet test separately protects the 44 CSS pixel coarse-pointer override.
