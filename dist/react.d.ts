import type { SupportProfile } from "./internal.js";
import { type HranessMailingListConfig, type HranessSocialConfig } from "./internal.js";
import { type FormEvent } from "react";
export interface HranessSiteFooterProps {
    /** Explicit Accounts product identity. Omit to render no paid-support control. */
    readonly support?: SupportProfile;
    /** Localize signup and account controls; defaults to browser language preferences after hydration. */
    readonly locale?: string | readonly string[];
    /** Accounts owns assignment and confirmed-subscription analytics. Disable for fixtures or an intentional holdback. */
    readonly experiment?: boolean;
    /** Sticky includes its own document footprint. Flow leaves placement to the host. */
    readonly placement?: "sticky" | "flow";
    /** Select signup, the signed-in account link, or no account/signup control. */
    readonly mailingList: HranessMailingListConfig;
    /** Omit the Hraness home link when the containing site already supplies that identity. */
    readonly showBrand?: boolean;
    /**
     * Retarget owned social destinations without adding platforms or changing
     * order. Defaults remain the shared Hraness profiles.
     */
    readonly social?: HranessSocialConfig;
}
/** Progressively enhance the canonical native mailing-list form when JavaScript is available. */
export declare function HranessSiteFooter({ locale: localeInput, experiment, placement, mailingList: mailingListInput, showBrand, social: socialInput, support, }: HranessSiteFooterProps): import("react").DetailedReactHTMLElement<{
    "aria-label": string;
    className: string;
    "data-brand": string;
    "data-experiment": string | undefined;
    "data-mailing-list": "none" | "signup" | "account";
    "data-slot": string;
    id: string;
    dangerouslySetInnerHTML: {
        __html: string;
    };
    onClick: (event: {
        target: EventTarget | null;
        defaultPrevented: boolean;
        preventDefault: () => void;
    }) => void;
    onSubmit: (event: FormEvent<HTMLElement>) => void;
    onPointerDownCapture: () => void;
    onFocusCapture: () => void;
    onKeyDown: (event: {
        key: string;
        preventDefault: () => void;
    }) => void;
    ref: import("react").RefObject<HTMLElement | null>;
}, HTMLElement>;
//# sourceMappingURL=react.d.ts.map