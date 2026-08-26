import {
  HRANESS_FOOTER_CLASS_NAME,
  HRANESS_FOOTER_LABEL,
  HRANESS_FOOTER_SLOT,
  HRANESS_SITE_FOOTER_INNER_HTML,
} from "./internal.js";
import { createElement } from "react";

/** Server-renderable React adapter for the canonical static footer contract. */
export function HranessSiteFooter() {
  return createElement("footer", {
    "aria-label": HRANESS_FOOTER_LABEL,
    className: HRANESS_FOOTER_CLASS_NAME,
    "data-slot": HRANESS_FOOTER_SLOT,
    // The HTML is composed only from immutable package-owned constants.
    dangerouslySetInnerHTML: { __html: HRANESS_SITE_FOOTER_INNER_HTML },
  });
}
