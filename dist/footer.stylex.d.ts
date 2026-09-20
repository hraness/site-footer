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
    supportIcon: string;
    disclosure: string;
    disclosureTrigger: string;
    triggerClosed: string;
    triggerOpen: string;
    disclosurePanel: string;
    dialog: string;
    dialogHeader: string;
    dialogTitle: string;
    dialogDescription: string;
    dialogClose: string;
    emailLabel: string;
    shimmer: string;
    brand: string;
    brandName: string;
    mark: string;
    links: string;
    socials: string;
    socialLink: string;
    socialIcon: string;
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
/** Historical layout arguments no longer change the stable signup surface. */
export declare function disclosureClassNames(_layout: FooterVariant["layout"]): {
    root: string;
    trigger: string;
    panel: string;
};
//# sourceMappingURL=footer.stylex.d.ts.map