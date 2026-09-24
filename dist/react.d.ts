import type { SupportProfile } from "./internal.js";
import type { HranessFooterConversionEvent } from "./internal.js";
export type { HranessFooterConversionEvent, HranessFooterConversionStage, HranessFooterConversionReason } from "./internal.js";
import { type HranessMailingListConfig, type HranessSocialConfig } from "./internal.js";
import { type FormEvent } from "react";
export interface HranessSiteFooterProps {
    /** Explicit Accounts product identity. Omit to render no paid-support control. */
    readonly support?: SupportProfile;
    /** Localize signup and account controls; defaults to browser language preferences after hydration. */
    readonly locale?: string | readonly string[];
    /** @deprecated Retained for source compatibility; never changes UI or requests assignments. */
    readonly experiment?: boolean;
    /** Optional, privacy-bounded observations. Omit when attribution is ineligible. */
    readonly onConversion?: ((event: HranessFooterConversionEvent) => void) | undefined;
    /**
     * Anonymous signup attribution. When omitted, it runs once cookie consent is
     * accepted or not required, except for Do Not Track, Global Privacy Control,
     * and automated browsers; an explicit value is the host's eligibility decision. English visitors on lists with a short product
     * name join the Accounts signup-label test.
     */
    readonly attribution?: boolean;
    /** Sticky includes its own document footprint. Flow leaves placement to the host. */
    readonly placement?: "sticky" | "flow";
    /** Select signup, the signed-in account link, or no account/signup control. */
    readonly mailingList: HranessMailingListConfig;
    /** Omit the Hraness home link when the containing site already supplies that identity. */
    readonly showBrand?: boolean;
    /**
     * True only when this site keeps visitors signed in with cookies. The cookie
     * note mentions sign-in only when it is true. Defaults to false.
     */
    readonly signIn?: boolean;
    /**
     * Retarget owned social destinations without adding platforms or changing
     * order. Defaults remain the shared Hraness profiles.
     */
    readonly social?: HranessSocialConfig;
}
/** Progressively enhance the canonical native mailing-list form when JavaScript is available. */
export declare function HranessSiteFooter({ locale: localeInput, onConversion, attribution: attributionRequested, placement, mailingList: mailingListInput, showBrand, signIn, social: socialInput, support, }: HranessSiteFooterProps): import("react").DetailedReactHTMLElement<{
    "aria-label": string;
    className: string;
    "data-brand": string;
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
    onInputCapture: (event: {
        target: EventTarget | null;
    }) => void;
    onInvalidCapture: (event: {
        target: EventTarget | null;
    }) => void;
    onKeyDown: (event: {
        key: string;
        shiftKey: boolean;
        preventDefault: () => void;
    }) => void;
    ref: import("react").RefObject<HTMLElement | null>;
}, HTMLElement>;
//# sourceMappingURL=react.d.ts.map