import { describe, expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  HRANESS_HOME_URL,
  HRANESS_NEWSLETTER_URL,
  hranessSocialLinks,
  renderHranessSiteFooter,
} from "../src/index.js";

const expectedSocialLinks = [
  ["x", "https://x.com/hraness"],
  ["instagram", "https://www.instagram.com/hraness/"],
  ["linkedin", "https://www.linkedin.com/in/hraness"],
  ["bluesky", "https://bsky.app/profile/hraness.bsky.social"],
  ["threads", "https://www.threads.com/@hraness"],
  ["github", "https://github.com/hraness"],
  ["tiktok", "https://www.tiktok.com/@hraness"],
  ["reddit", "https://www.reddit.com/user/bgdotjpg/"],
  ["twitch", "https://www.twitch.tv/hranessdotcom"],
  ["youtube", "https://www.youtube.com/@hraness"],
] as const;

describe("Hraness site footer", () => {
  test("freezes the organization-owned link order", () => {
    expect(HRANESS_HOME_URL).toBe("https://hraness.com/");
    expect(HRANESS_NEWSLETTER_URL).toBe("https://hraness.substack.com/subscribe");
    expect(hranessSocialLinks.map(({ platform, href }) => [platform, href])).toEqual(
      expectedSocialLinks.map(([platform, href]) => [platform, href]),
    );
  });

  test("renders newsletter first and ten accessible icon links", () => {
    const { document } = parseHTML(renderHranessSiteFooter());
    const footer = document.querySelector('footer[data-slot="hraness-site-footer"]');
    const nav = footer?.querySelector('nav[aria-label="Hraness links"]');
    const socialItems = footer?.querySelectorAll(".hraness-site-footer__socials > li");
    const links = [...(nav?.querySelectorAll("a") ?? [])];

    expect(footer?.getAttribute("aria-label")).toBe("Hraness network");
    expect(links).toHaveLength(11);
    expect(socialItems).toHaveLength(10);
    expect(links[0]?.textContent).toBe("newsletter");
    expect(links[0]?.getAttribute("href")).toBe(HRANESS_NEWSLETTER_URL);
    expect(links.slice(1).map((link) => link.getAttribute("href"))).toEqual(expectedSocialLinks.map(([, href]) => href));

    for (const link of links.slice(1)) {
      expect(link.getAttribute("aria-label")).toBeTruthy();
      expect(link.getAttribute("title")).toBeTruthy();
      expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
  });

  test("uses the exact raw Ra mark without image or mask dependencies", () => {
    const { document } = parseHTML(renderHranessSiteFooter());
    const mark = document.querySelector('svg[data-slot="hraness-mark"]');

    expect(mark?.getAttribute("viewBox")).toBe("0 0 512 512");
    expect(mark?.querySelectorAll("path")).toHaveLength(4);
    expect(mark?.querySelectorAll("circle")).toHaveLength(1);
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("mask")).toBeNull();
    expect(renderHranessSiteFooter()).not.toContain("0thernet");
  });
});
