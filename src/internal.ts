import {
  BlueskyIcon,
  GithubIcon,
  InstagramIcon,
  Linkedin01Icon,
  NewTwitterIcon,
  RedditIcon,
  ThreadsIcon,
  TiktokIcon,
  TwitchIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";

type IconAttributeValue = boolean | number | string;
type IconAttributes = Readonly<Record<string, IconAttributeValue>>;
type IconDefinition = ReadonlyArray<readonly ["path", IconAttributes]>;

export const HRANESS_FOOTER_LABEL = "Hraness network";
export const HRANESS_FOOTER_CLASS_NAME = "hraness-site-footer";
export const HRANESS_FOOTER_SLOT = "hraness-site-footer";

export type HranessSocialPlatform =
  | "x"
  | "instagram"
  | "linkedin"
  | "bluesky"
  | "threads"
  | "github"
  | "tiktok"
  | "reddit"
  | "twitch"
  | "youtube";

export interface HranessSocialLink {
  readonly platform: HranessSocialPlatform;
  readonly label: string;
  readonly title: string;
  readonly href: string;
}

export const HRANESS_SOCIAL_LINKS = [
  {
    platform: "x",
    label: "Hraness on X",
    title: "X",
    href: "https://x.com/hraness",
  },
  {
    platform: "instagram",
    label: "Hraness on Instagram",
    title: "Instagram",
    href: "https://www.instagram.com/hraness/",
  },
  {
    platform: "linkedin",
    label: "Ben Guo on LinkedIn",
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/hraness",
  },
  {
    platform: "bluesky",
    label: "Hraness on Bluesky",
    title: "Bluesky",
    href: "https://bsky.app/profile/hraness.bsky.social",
  },
  {
    platform: "threads",
    label: "Hraness on Threads",
    title: "Threads",
    href: "https://www.threads.com/@hraness",
  },
  {
    platform: "github",
    label: "Hraness on GitHub",
    title: "GitHub",
    href: "https://github.com/hraness",
  },
  {
    platform: "tiktok",
    label: "Hraness on TikTok",
    title: "TikTok",
    href: "https://www.tiktok.com/@hraness",
  },
  {
    platform: "reddit",
    label: "Ben Guo on Reddit",
    title: "Reddit",
    href: "https://www.reddit.com/user/bgdotjpg/",
  },
  {
    platform: "twitch",
    label: "Hraness on Twitch",
    title: "Twitch",
    href: "https://www.twitch.tv/hranessdotcom",
  },
  {
    platform: "youtube",
    label: "Hraness on YouTube",
    title: "YouTube",
    href: "https://www.youtube.com/@hraness",
  },
] as const satisfies ReadonlyArray<HranessSocialLink>;

const ICONS: Readonly<Record<HranessSocialPlatform, IconDefinition>> = {
  x: NewTwitterIcon as unknown as IconDefinition,
  instagram: InstagramIcon as unknown as IconDefinition,
  linkedin: Linkedin01Icon as unknown as IconDefinition,
  bluesky: BlueskyIcon as unknown as IconDefinition,
  threads: ThreadsIcon as unknown as IconDefinition,
  github: GithubIcon as unknown as IconDefinition,
  tiktok: TiktokIcon as unknown as IconDefinition,
  reddit: RedditIcon as unknown as IconDefinition,
  twitch: TwitchIcon as unknown as IconDefinition,
  youtube: YoutubeIcon as unknown as IconDefinition,
};

const ATTRIBUTE_NAMES: Readonly<Record<string, string>> = {
  d: "d",
  fill: "fill",
  fillRule: "fill-rule",
  stroke: "stroke",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  strokeWidth: "stroke-width",
};

function escapeAttribute(value: IconAttributeValue): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderIconPaths(icon: IconDefinition): string {
  return icon.map(([tag, attributes]) => {
    if (tag !== "path") {
      throw new TypeError(`Unsupported Hraness footer icon element: ${tag}`);
    }

    const renderedAttributes = Object.entries(attributes)
      .filter(([name]) => name !== "key")
      .map(([name, value]) => {
        const attributeName = ATTRIBUTE_NAMES[name];
        if (attributeName === undefined) {
          throw new TypeError(`Unsupported Hraness footer icon attribute: ${name}`);
        }
        return `${attributeName}="${escapeAttribute(value)}"`;
      })
      .join(" ");

    return `<path ${renderedAttributes}></path>`;
  }).join("");
}

function renderSocialIcon(platform: HranessSocialPlatform): string {
  return `<svg aria-hidden="true" class="hraness-site-footer__social-icon" data-slot="social-icon" fill="none" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${renderIconPaths(ICONS[platform])}</svg>`;
}

const RA_MARK = '<svg aria-hidden="true" class="hraness-site-footer__mark" data-slot="hraness-mark" focusable="false" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M372 141a116 116 0 1 1-232 0 116 116 0 1 1 232 0Zm-14 0a102 102 0 1 0-204 0 102 102 0 1 0 204 0Zm-8 0a94 94 0 1 1-188 0 94 94 0 1 1 188 0Z" fill="currentColor" fill-rule="evenodd"></path><path d="M211 252c75-8 154 30 204 94 32 40 51 89 59 142H184c20-28 29-57 22-87-9-39-26-71-28-99-2-22 9-39 33-50Z" fill="currentColor"></path><path d="M246 270c-27-20-67-23-100-9-25 11-42 31-46 56l-34 20 38 12c4 25 14 47 31 66 15 13 22 32 18 56l-14 17h116c-20-27-23-50-8-68 6-8 14-14 23-21 23-20 34-50 28-79-5-22-23-40-52-50ZM132 309c9-14 22-22 38-22 13 0 25 7 34 19-10 14-23 22-39 22-14 0-25-6-33-19Z" fill="currentColor" fill-rule="evenodd"></path><path d="M151 410c-2 30-16 57-43 78h197c-19-27-40-49-63-63-28-18-59-23-91-15Z" fill="currentColor"></path><circle cx="166" cy="307" fill="currentColor" r="8"></circle></svg>';

export const HRANESS_SITE_FOOTER_INNER_HTML = `<div class="hraness-site-footer__inner"><a aria-label="Hraness home" class="hraness-site-footer__brand" href="https://hraness.com/">${RA_MARK}<span class="hraness-site-footer__wordmark">hraness</span></a><nav aria-label="Hraness links" class="hraness-site-footer__links"><a class="hraness-site-footer__newsletter" href="https://hraness.substack.com/subscribe">newsletter</a><ul class="hraness-site-footer__socials">${HRANESS_SOCIAL_LINKS.map((link) => `<li><a aria-label="${escapeAttribute(link.label)}" class="hraness-site-footer__social-link" href="${escapeAttribute(link.href)}" rel="me" title="${escapeAttribute(link.title)}">${renderSocialIcon(link.platform)}</a></li>`).join("")}</ul></nav></div>`;
