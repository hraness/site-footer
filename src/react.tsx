import {
  HRANESS_FOOTER_CLASS_NAME,
  HRANESS_FOOTER_LABEL,
  HRANESS_FOOTER_SLOT,
  renderHranessSiteFooterInnerHtml,
} from "./internal.js";
import { createElement } from "react";

export interface HranessSiteFooterProps {
  /** Omit the Hraness home link when the containing site already supplies that identity. */
  readonly showBrand?: boolean;
}

/** Server-renderable React adapter for the canonical static footer contract. */
export function HranessSiteFooter({ showBrand = true }: HranessSiteFooterProps = {}) {
  return createElement("footer", {
    "aria-label": HRANESS_FOOTER_LABEL,
    className: HRANESS_FOOTER_CLASS_NAME,
    "data-brand": showBrand ? "visible" : "hidden",
    "data-slot": HRANESS_FOOTER_SLOT,
    // The HTML is composed only from immutable package-owned constants.
    dangerouslySetInnerHTML: { __html: renderHranessSiteFooterInnerHtml(showBrand) },
  });
}
