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
    disclosureLabel: string;
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
/**
 * The footer always sits in normal document flow. The historical `sticky`
 * placement argument is accepted for compatibility and no longer changes
 * presentation.
 */
export declare function footerClassName(signup: boolean, _sticky?: boolean): string;
export declare function footerInnerClassName(signup: boolean, _sticky?: boolean, color?: FooterVariant["color"], account?: boolean, support?: boolean, showBrand?: boolean): string;
export declare function socialItemClassName(index?: number): string;
export declare function mailingStatusClassName(state: string): string;
/** Historical layout arguments no longer change the stable signup surface. */
export declare function disclosureClassNames(_layout: FooterVariant["layout"]): {
    root: string;
    trigger: string;
    panel: string;
};
//# sourceMappingURL=footer.stylex.d.ts.map