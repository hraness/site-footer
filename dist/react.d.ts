import type { SupportProfile } from "./internal.js";
import type { HranessFooterConversionEvent } from "./internal.js";
export type { HranessFooterConversionEvent, HranessFooterConversionStage, HranessFooterConversionReason } from "./internal.js";
import { type HranessMailingListConfig, type HranessSocialConfig } from "./internal.js";
import { type FormEvent } from "react";
export interface HranessCookieConsentProps {
    /** Include the essential sign-in cookie explanation only on sites that use it. */
    readonly signIn?: boolean;
    /** Resolved preferences stay in the corner by default; use flow near a route end. */
    readonly placement?: "corner" | "flow";
}
/** The shared consent note for focused app routes that omit the site footer. */
export declare function HranessCookieConsent({ signIn, placement }?: HranessCookieConsentProps): import("react").DetailedReactHTMLElement<{
    ref: import("react").RefObject<HTMLDivElement | null>;
    className: string;
    dangerouslySetInnerHTML: {
        __html: string;
    };
}, HTMLDivElement>;
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
    /**
     * @deprecated Accepted for compatibility and inert. The footer always sits
     * in normal document flow at the end of the page; a visible cookie note
     * floats as a compact corner notice until accepted.
     */
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
    /**
     * Absolute URL of the page being rendered, such as
     * `https://hraness.com/valhalla`, so server-rendered and no-JavaScript
     * signups send their page. Any query string or fragment is dropped. After
     * hydration the form follows `location.origin + location.pathname` across
     * client navigation, whether or not this is set.
     */
    readonly pageUrl?: string;
}
/** Progressively enhance the canonical native mailing-list form when JavaScript is available. */
export declare function HranessSiteFooter({ locale: localeInput, onConversion, attribution: attributionRequested, placement, mailingList: mailingListInput, showBrand, signIn, social: socialInput, support, pageUrl: pageUrlInput, }: HranessSiteFooterProps): import("react").DetailedReactHTMLElement<{
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
        detail: number;
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