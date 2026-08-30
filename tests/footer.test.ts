import { describe, expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  HRANESS_HOME_URL,
  HRANESS_MAILING_SUBSCRIBE_URL,
  HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL,
  HRANESS_TURNSTILE_RESPONSE_FIELD,
  HRANESS_TURNSTILE_SCRIPT_URL,
  getHranessMailingTurnstileAction,
  hranessSocialLinks,
  renderHranessSiteFooter,
  type HranessMailingListConfig,
} from "../src/index.js";

const noMailingList = { kind: "none" } as const satisfies HranessMailingListConfig;
const TURNSTILE_TEST_SITEKEY = "1x00000000000000000000AA";
const TURNSTILE_PRODUCTION_SITEKEY = "0x4AAF00AAAABn0R22HWm-YUc";
const TURNSTILE_SCRIPT_NONCE = "dGVzdC1ub25jZS0xMjM0";
const productMailingList = {
  audience: "soundfish",
  kind: "signup",
  turnstileSitekey: TURNSTILE_TEST_SITEKEY,
} as const satisfies HranessMailingListConfig;

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
  test("freezes the organization-owned home and social-link order", () => {
    expect(HRANESS_HOME_URL).toBe("https://hraness.com/");
    expect(hranessSocialLinks.map(({ platform, href }) => [platform, href])).toEqual(
      expectedSocialLinks.map(([platform, href]) => [platform, href]),
    );
  });

  test("requires an explicit mailing-list mode", () => {
    expect(() => renderHranessSiteFooter({} as { mailingList: HranessMailingListConfig }))
      .toThrow("mailingList must be explicitly configured");
    expect(() => renderHranessSiteFooter({
      mailingList: { audience: "", kind: "signup" },
    } as { mailingList: HranessMailingListConfig })).toThrow(
      "mailingList configuration is invalid",
    );
    expect(() => renderHranessSiteFooter({
      mailingList: {
        audience: " soundfish",
        kind: "signup",
        turnstileSitekey: TURNSTILE_TEST_SITEKEY,
      },
    })).toThrow("audience IDs must be canonical lowercase slugs");
    expect(() => renderHranessSiteFooter({
      mailingList: {
        audience: "soundfish",
        kind: "signup",
        turnstileSitekey: "",
      },
    })).toThrow("Turnstile sitekeys must be 20-100 character");
    expect(() => renderHranessSiteFooter({
      mailingList: {
        audience: "soundfish",
        kind: "signup",
        turnstileSitekey: "not a key",
      },
    })).toThrow("Turnstile sitekeys must be 20-100 character");
    expect(() => renderHranessSiteFooter({
      mailingList: {
        audience: "soundfish",
        kind: "signup",
        turnstileSitekey: "short-placeholder",
      },
    })).toThrow("Turnstile sitekeys must be 20-100 character");
    expect(renderHranessSiteFooter({
      mailingList: {
        audience: "soundfish",
        kind: "signup",
        turnstileSitekey: TURNSTILE_PRODUCTION_SITEKEY,
      },
    })).toContain(`data-sitekey="${TURNSTILE_PRODUCTION_SITEKEY}"`);
  });

  test("can explicitly omit mailing-list UI without changing accessible social links", () => {
    const html = renderHranessSiteFooter({ mailingList: noMailingList });
    const { document } = parseHTML(html);
    const footer = document.querySelector('footer[data-slot="hraness-site-footer"]');
    const nav = footer?.querySelector('nav[aria-label="Hraness links"]');
    const links = [...(nav?.querySelectorAll("a") ?? [])];

    expect(footer?.getAttribute("aria-label")).toBe("Hraness network");
    expect(footer?.id).toBe("hraness-site-footer");
    expect(document.querySelectorAll("#hraness-site-footer")).toHaveLength(1);
    expect(footer?.getAttribute("data-mailing-list")).toBe("none");
    expect(footer?.querySelector("form")).toBeNull();
    expect(footer?.querySelector("script")).toBeNull();
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      expectedSocialLinks.map(([, href]) => href),
    );
    expect(html).not.toContain("substack.com");

    for (const link of links) {
      expect(link.getAttribute("aria-label")).toBeTruthy();
      expect(link.getAttribute("title")).toBeTruthy();
      expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
  });

  test("renders a product-scoped native POST form before the unchanged social links", () => {
    const html = renderHranessSiteFooter({ mailingList: productMailingList });
    const { document } = parseHTML(html);
    const footer = document.querySelector('footer[data-slot="hraness-site-footer"]');
    const form = footer?.querySelector('form[data-slot="hraness-mailing-list-signup"]');
    const email = form?.querySelector('input[name="email"]');
    const audience = form?.querySelector('input[name="audience"]');
    const source = form?.querySelector('input[name="source"]');
    const submit = form?.querySelector('button[type="submit"]');
    const turnstile = form?.querySelector('[data-slot="hraness-turnstile-widget"]');
    const turnstileScript = footer?.querySelector(
      'script[data-slot="hraness-turnstile-script"]',
    );
    const socialLinks = [...(footer?.querySelectorAll(".hraness-site-footer__social-link") ?? [])];

    expect(HRANESS_MAILING_SUBSCRIBE_URL).toBe(
      "https://account.hraness.com/api/mailing/subscribe",
    );
    expect(footer?.getAttribute("data-mailing-list")).toBe("signup");
    expect(form?.getAttribute("action")).toBe(HRANESS_MAILING_SUBSCRIBE_URL);
    expect(form?.getAttribute("method")).toBe("post");
    expect(form?.getAttribute("enctype")).toBe("multipart/form-data");
    expect(form?.getAttribute("aria-label")).toBe("Subscribe by email");
    expect(email?.getAttribute("type")).toBe("email");
    expect(email?.hasAttribute("required")).toBeTrue();
    expect(email?.getAttribute("autocomplete")).toBe("email");
    expect(email?.getAttribute("aria-describedby")).toBe(
      "hraness-mailing-list-status",
    );
    expect(email?.closest("label")?.textContent).toContain("Email address");
    expect(audience?.getAttribute("value")).toBe("soundfish");
    expect(source?.getAttribute("value")).toBe("hraness-site-footer");
    expect(getHranessMailingTurnstileAction("stripe-history")).toBe(
      "mailing_stripe_history",
    );
    expect(turnstile?.classList.contains("cf-turnstile")).toBeTrue();
    expect(turnstile?.getAttribute("data-sitekey")).toBe(TURNSTILE_TEST_SITEKEY);
    expect(turnstile?.getAttribute("data-action")).toBe("mailing_soundfish");
    expect(turnstile?.getAttribute("data-appearance")).toBe("interaction-only");
    expect(turnstile?.getAttribute("data-execution")).toBe("render");
    expect(turnstile?.getAttribute("data-refresh-expired")).toBe("auto");
    expect(turnstile?.getAttribute("data-retry")).toBe("auto");
    expect(turnstile?.getAttribute("data-response-field")).toBe("true");
    expect(turnstile?.getAttribute("data-response-field-name")).toBe(
      HRANESS_TURNSTILE_RESPONSE_FIELD,
    );
    expect(turnstileScript?.getAttribute("src")).toBe(HRANESS_TURNSTILE_SCRIPT_URL);
    expect(turnstileScript?.hasAttribute("async")).toBeTrue();
    expect(turnstileScript?.hasAttribute("defer")).toBeTrue();
    expect(submit?.textContent).toBe("Subscribe");
    const status = form?.querySelector('[data-slot="hraness-mailing-list-status"]');
    expect(status?.id).toBe("hraness-mailing-list-status");
    expect(status?.getAttribute("aria-atomic")).toBe("true");
    expect(status?.textContent).toBe("");
    expect(socialLinks.map((link) => link.getAttribute("href"))).toEqual(
      expectedSocialLinks.map(([, href]) => href),
    );
    expect(html.indexOf('data-slot="hraness-mailing-list-signup"')).toBeLessThan(
      html.indexOf('aria-label="Hraness links"'),
    );
    expect(html).not.toContain("substack.com");
  });

  test("supports strict CSP nonces without weakening the exact Turnstile URL", () => {
    const html = renderHranessSiteFooter({
      mailingList: productMailingList,
      turnstileScriptNonce: TURNSTILE_SCRIPT_NONCE,
    });
    const { document } = parseHTML(html);
    const script = document.querySelector<HTMLScriptElement>(
      'script[data-slot="hraness-turnstile-script"]',
    );

    expect(HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL).toBe(
      `${HRANESS_TURNSTILE_SCRIPT_URL}?render=explicit`,
    );
    expect(script?.src).toBe(HRANESS_TURNSTILE_SCRIPT_URL);
    expect(script?.getAttribute("nonce")).toBe(TURNSTILE_SCRIPT_NONCE);
    expect(() => renderHranessSiteFooter({
      mailingList: productMailingList,
      turnstileScriptNonce: "too-short",
    })).toThrow("script nonces must be 16-256 character");
    expect(() => renderHranessSiteFooter({
      mailingList: productMailingList,
      turnstileScriptNonce: "not valid nonce value",
    })).toThrow("script nonces must be 16-256 character");
  });

  test("fails closed when an audience cannot produce the bounded Turnstile action", () => {
    expect(() => renderHranessSiteFooter({
      mailingList: {
        audience: "UPPERCASE",
        kind: "signup",
        turnstileSitekey: TURNSTILE_TEST_SITEKEY,
      },
    })).toThrow("canonical lowercase slugs");
    expect(() => renderHranessSiteFooter({
      mailingList: {
        audience: "audience-name-that-is-too-long",
        kind: "signup",
        turnstileSitekey: TURNSTILE_TEST_SITEKEY,
      },
    })).toThrow("at most 24 characters");
  });

  test("can omit the duplicate Hraness brand without changing the configured audience", () => {
    const { document } = parseHTML(renderHranessSiteFooter({
      mailingList: productMailingList,
      showBrand: false,
    }));
    const footer = document.querySelector('footer[data-slot="hraness-site-footer"]');

    expect(footer?.getAttribute("data-brand")).toBe("hidden");
    expect(footer?.querySelector(".hraness-site-footer__brand")).toBeNull();
    expect(footer?.querySelector('[data-slot="hraness-mark"]')).toBeNull();
    expect(footer?.querySelector('input[name="audience"]')?.getAttribute("value"))
      .toBe("soundfish");
    expect(footer?.querySelectorAll(".hraness-site-footer__social-link")).toHaveLength(10);
  });

  test("uses the exact raw Ra mark without image or mask dependencies", () => {
    const html = renderHranessSiteFooter({ mailingList: noMailingList });
    const { document } = parseHTML(html);
    const mark = document.querySelector('svg[data-slot="hraness-mark"]');

    expect(mark?.getAttribute("viewBox")).toBe("0 0 512 512");
    expect(mark?.querySelectorAll("path")).toHaveLength(4);
    expect(mark?.querySelectorAll("circle")).toHaveLength(1);
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("mask")).toBeNull();
    expect(html).not.toContain("0thernet");
  });
});
