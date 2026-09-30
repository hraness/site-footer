export declare const raMarkPaths = "<path d=\"M372 141a116 116 0 1 1-232 0 116 116 0 1 1 232 0Zm-14 0a102 102 0 1 0-204 0 102 102 0 1 0 204 0Zm-8 0a94 94 0 1 1-188 0 94 94 0 1 1 188 0Z\" fill=\"currentColor\" fill-rule=\"evenodd\"></path><path d=\"M211 252c75-8 154 30 204 94 32 40 51 89 59 142H184c20-28 29-57 22-87-9-39-26-71-28-99-2-22 9-39 33-50Z\" fill=\"currentColor\"></path><path d=\"M246 270c-27-20-67-23-100-9-25 11-42 31-46 56l-34 20 38 12c4 25 14 47 31 66 15 13 22 32 18 56l-14 17h116c-20-27-23-50-8-68 6-8 14-14 23-21 23-20 34-50 28-79-5-22-23-40-52-50ZM132 309c9-14 22-22 38-22 13 0 25 7 34 19-10 14-23 22-39 22-14 0-25-6-33-19Z\" fill=\"currentColor\" fill-rule=\"evenodd\"></path><path d=\"M151 410c-2 30-16 57-43 78h197c-19-27-40-49-63-63-28-18-59-23-91-15Z\" fill=\"currentColor\"></path><circle cx=\"166\" cy=\"307\" fill=\"currentColor\" r=\"8\"></circle>";
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
    markRoot: string;
    markPaint: string;
    mark: string;
    links: string;
    socials: string;
    socialLink: string;
    socialIcon: string;
    consentRoot: string;
    consent: string;
    consentAccept: string;
    consentMore: string;
    consentLearn: string;
    consentLabel: string;
    consentActions: string;
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