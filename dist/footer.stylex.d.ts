import * as stylex from "@stylexjs/stylex";
import type { FooterVariant } from "./experiment.js";
export declare const disclosureMarker: Readonly<{
    readonly marker: stylex.StyleXClassNameFor<"marker", symbol>;
}>;
export declare const rootMarker: Readonly<{
    readonly marker: stylex.StyleXClassNameFor<"marker", symbol>;
}>;
export declare const footerClasses: {
    account: string;
    support: string;
    disclosure: string;
    disclosureTrigger: string;
    triggerClosed: string;
    triggerOpen: string;
    disclosurePanel: string;
    shimmer: string;
    brand: string;
    mark: string;
    links: string;
    socials: string;
    socialLink: string;
    socialIcon: string;
    attribution: string;
    attributionTitle: string;
    attributionSubtitle: string;
    consent: string;
    consentAccept: string;
    consentSeparator: string;
    consentMore: string;
    consentLearn: string;
    consentPanel: string;
    consentLink: string;
    mailing: string;
    honeypot: string;
    mailingControls: string;
    mailingLabel: string;
    mailingInput: string;
    mailingSubmit: string;
    mailingConfirmation: string;
    visuallyHidden: string;
};
export declare function footerClassName(signup: boolean, sticky?: boolean): string;
export declare function footerInnerClassName(signup: boolean, sticky?: boolean, color?: FooterVariant["color"], account?: boolean, support?: boolean): string;
export declare function socialItemClassName(index?: number): string;
export declare function mailingStatusClassName(state: string): string;
export declare function disclosureClassNames(layout: FooterVariant["layout"]): {
    root: string;
    trigger: string;
    panel: string;
};
//# sourceMappingURL=footer.stylex.d.ts.map