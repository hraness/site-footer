export declare const HRANESS_FOOTER_LABEL = "Hraness network";
export declare const HRANESS_FOOTER_CLASS_NAME = "hraness-site-footer";
export declare const HRANESS_FOOTER_SLOT = "hraness-site-footer";
export declare const HRANESS_MAILING_FORM_SLOT = "hraness-mailing-list-signup";
export declare const HRANESS_MAILING_SOURCE = "hraness-site-footer";
export declare const HRANESS_MAILING_STATUS_SLOT = "hraness-mailing-list-status";
export declare const HRANESS_MAILING_SUBSCRIBE_URL = "https://account.hraness.com/api/mailing/subscribe";
export declare const HRANESS_TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";
export declare const HRANESS_TURNSTILE_SCRIPT_SLOT = "hraness-turnstile-script";
export declare const HRANESS_TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";
export declare const HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
export declare const HRANESS_TURNSTILE_WIDGET_SLOT = "hraness-turnstile-widget";
export type HranessMailingListConfig = Readonly<{
    audience: string;
    kind: "signup";
    turnstileSitekey: string;
}> | Readonly<{
    kind: "none";
}>;
export type HranessMailingListRenderState = Readonly<{
    kind: "idle";
}> | Readonly<{
    audience: string;
    email: string;
    kind: "pending";
}> | Readonly<{
    audience: string;
    kind: "accepted";
}> | Readonly<{
    audience: string;
    email: string;
    kind: "error";
}> | Readonly<{
    audience: string;
    email: string;
    kind: "verification-error";
}>;
export type HranessSocialPlatform = "substack" | "x" | "instagram" | "linkedin" | "bluesky" | "threads" | "github" | "tiktok" | "reddit" | "twitch" | "youtube";
export interface HranessSocialLink {
    readonly platform: HranessSocialPlatform;
    readonly label: string;
    readonly title: string;
    readonly href: string;
}
export declare const HRANESS_SOCIAL_LINKS: readonly [{
    readonly platform: "substack";
    readonly label: "Hraness on Substack";
    readonly title: "Substack";
    readonly href: "https://substack.com/@hraness";
}, {
    readonly platform: "x";
    readonly label: "Hraness on X";
    readonly title: "X";
    readonly href: "https://x.com/hraness";
}, {
    readonly platform: "instagram";
    readonly label: "Hraness on Instagram";
    readonly title: "Instagram";
    readonly href: "https://www.instagram.com/hraness/";
}, {
    readonly platform: "linkedin";
    readonly label: "Ben Guo on LinkedIn";
    readonly title: "LinkedIn";
    readonly href: "https://www.linkedin.com/in/hraness";
}, {
    readonly platform: "bluesky";
    readonly label: "Hraness on Bluesky";
    readonly title: "Bluesky";
    readonly href: "https://bsky.app/profile/hraness.bsky.social";
}, {
    readonly platform: "threads";
    readonly label: "Hraness on Threads";
    readonly title: "Threads";
    readonly href: "https://www.threads.com/@hraness";
}, {
    readonly platform: "github";
    readonly label: "Hraness on GitHub";
    readonly title: "GitHub";
    readonly href: "https://github.com/hraness";
}, {
    readonly platform: "tiktok";
    readonly label: "Hraness on TikTok";
    readonly title: "TikTok";
    readonly href: "https://www.tiktok.com/@hraness";
}, {
    readonly platform: "reddit";
    readonly label: "Ben Guo on Reddit";
    readonly title: "Reddit";
    readonly href: "https://www.reddit.com/user/bgdotjpg/";
}, {
    readonly platform: "twitch";
    readonly label: "Hraness on Twitch";
    readonly title: "Twitch";
    readonly href: "https://www.twitch.tv/hranessdotcom";
}, {
    readonly platform: "youtube";
    readonly label: "Hraness on YouTube";
    readonly title: "YouTube";
    readonly href: "https://www.youtube.com/@hraness";
}];
export declare function parseHranessMailingListConfig(value: HranessMailingListConfig): HranessMailingListConfig;
export declare function parseHranessTurnstileScriptNonce(value: string | undefined): string | undefined;
export declare function getHranessMailingTurnstileAction(audience: string): string;
export declare function renderHranessSiteFooterInnerHtml(showBrand: boolean, mailingList: HranessMailingListConfig, state?: HranessMailingListRenderState, turnstileMode?: "explicit" | "implicit", turnstileScriptNonce?: string): string;
//# sourceMappingURL=internal.d.ts.map