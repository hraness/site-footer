export declare const HRANESS_FOOTER_LABEL = "Hraness network";
export declare const HRANESS_FOOTER_CLASS_NAME = "hraness-site-footer";
export declare const HRANESS_FOOTER_SLOT = "hraness-site-footer";
export type HranessSocialPlatform = "x" | "instagram" | "linkedin" | "bluesky" | "threads" | "github" | "tiktok" | "reddit" | "twitch" | "youtube";
export interface HranessSocialLink {
    readonly platform: HranessSocialPlatform;
    readonly label: string;
    readonly title: string;
    readonly href: string;
}
export declare const HRANESS_SOCIAL_LINKS: readonly [{
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
export declare function renderHranessSiteFooterInnerHtml(showBrand: boolean): string;
//# sourceMappingURL=internal.d.ts.map