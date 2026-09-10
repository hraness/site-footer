import { type HranessMailingListConfig, type HranessSocialConfig } from "./internal.js";
import { type FormEvent } from "react";
export interface HranessSiteFooterProps {
    /** Explicitly select one mailing-list audience or omit mailing-list UI. */
    readonly mailingList: HranessMailingListConfig;
    /** Omit the Hraness home link when the containing site already supplies that identity. */
    readonly showBrand?: boolean;
    /**
     * Retarget owned social destinations without adding platforms or changing
     * order. Defaults remain the shared Hraness profiles.
     */
    readonly social?: HranessSocialConfig;
    /** Optional per-response CSP nonce used only when this component inserts Turnstile. */
    readonly turnstileScriptNonce?: string;
}
/** Progressively enhance the canonical native mailing-list form when JavaScript is available. */
export declare function HranessSiteFooter({ mailingList: mailingListInput, showBrand, social: socialInput, turnstileScriptNonce: turnstileScriptNonceInput, }: HranessSiteFooterProps): import("react").DetailedReactHTMLElement<{
    "aria-label": string;
    className: string;
    "data-brand": string;
    "data-mailing-list": "none" | "signup";
    "data-slot": string;
    id: string;
    dangerouslySetInnerHTML: {
        __html: string;
    };
    onSubmit: (event: FormEvent<HTMLElement>) => void;
    ref: import("react").RefObject<HTMLElement | null>;
}, HTMLElement>;
//# sourceMappingURL=react.d.ts.map