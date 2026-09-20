import { describe, expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  HRANESS_HOME_URL,
  HRANESS_MAILING_SUBSCRIBE_URL,
  hranessSocialLinks,
  renderHranessSiteFooter,
  type HranessMailingListConfig,
} from "../src/index.js";

const noMailingList = { kind: "none" } as const satisfies HranessMailingListConfig;
const productMailingList = {
  audience: "soundfish",
  kind: "signup",
} as const satisfies HranessMailingListConfig;

const expectedSocialLinks = [
  ["substack", "https://substack.com/@hraness"],
  ["x", "https://x.com/hraness"],
  ["linkedin", "https://www.linkedin.com/company/hraness"],
  ["github", "https://github.com/hraness"],
] as const;

const aichartsSocial = {
  github: {
    href: "https://github.com/hraness/aicharts",
    label: "AI Charts on GitHub",
  },
  x: {
    href: "https://x.com/aichartsio",
    label: "AI Charts on X",
  },
} as const;

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
      mailingList: { audience: 5, kind: "signup" },
    } as unknown as { mailingList: HranessMailingListConfig })).toThrow(
      "mailingList configuration is invalid",
    );
    expect(() => renderHranessSiteFooter({
      mailingList: { audience: "", kind: "signup" },
    })).toThrow("audience IDs must be canonical lowercase slugs");
    expect(() => renderHranessSiteFooter({
      mailingList: {
        audience: " soundfish",
        kind: "signup",
      },
    })).toThrow("audience IDs must be canonical lowercase slugs");
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
    expect(links[0]?.getAttribute("aria-label")).toBe("Hraness on Substack");
    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "Hraness on Substack",
      "Hraness on X",
      "Hraness on LinkedIn",
      "Hraness on GitHub",
    ]);
    expect(html).not.toContain("Ben Guo on LinkedIn");
    expect(html).not.toContain("bluesky");

    for (const link of links) {
      expect(link.getAttribute("aria-label")).toBeTruthy();
      expect(link.getAttribute("title")).toBeTruthy();
      expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
  });

  test("attributes every footer to the organization, never to a person", () => {
    const support = { id: "soundfish", name: "Soundfish", updates: true, valueProposition: "Support browser music tools." };
    for (const options of [
      { mailingList: noMailingList },
      { mailingList: productMailingList },
      { mailingList: { kind: "account" } as const },
      { mailingList: productMailingList, support },
    ]) {
      const html = renderHranessSiteFooter(options);
      const { document } = parseHTML(html);
      const footer = document.querySelector('footer[data-slot="hraness-site-footer"]')!;
      const brand = footer.querySelector(".hraness-site-footer__brand")!;

      // One organization-owned lockup: the Ra mark followed by "by Hraness".
      expect(brand.tagName).toBe("A");
      expect(brand.getAttribute("href")).toBe("https://hraness.com/");
      expect(brand.getAttribute("aria-label")).toBe("Hraness home");
      expect(brand.getAttribute("lang")).toBe("en");
      expect(brand.getAttribute("dir")).toBe("ltr");
      expect(brand.querySelector('svg[data-slot="hraness-mark"]')).not.toBeNull();
      const name = brand.querySelector(".hraness-site-footer__brand-name")!;
      expect(name.tagName).toBe("SPAN");
      expect(name.textContent).toBe("by Hraness");
      expect(footer.querySelectorAll(".hraness-site-footer__brand")).toHaveLength(1);
      expect(footer.querySelector('[data-slot="hraness-attribution"], .hraness-site-footer__attribution')).toBeNull();
      expect(html).not.toMatch(/Ben Guo|Built by Ben/u);

      // Document order matches the wide visual order: identity and account or
      // signup controls, optional support, consent, then socials.
      const order = ["hraness-mailing-list-signup", "hraness-account-link", "hraness-support-link", "hraness-cookie-consent"]
        .map((slot) => html.indexOf(`data-slot="${slot}"`))
        .filter((offset) => offset >= 0);
      expect(order).toEqual([...order].sort((left, right) => left - right));
      expect(html.indexOf('data-slot="hraness-cookie-consent"')).toBeLessThan(html.indexOf('aria-label="Hraness links"'));
      expect(footer.querySelectorAll(".hraness-site-footer__social-link")).toHaveLength(4);
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
    const honeypot = form?.querySelector('input[name="website"]');
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
    expect(honeypot?.getAttribute("aria-hidden")).toBe("true");
    expect(honeypot?.getAttribute("tabindex")).toBe("-1");
    expect(honeypot?.getAttribute("autocomplete")).toBe("off");
    expect(honeypot?.getAttribute("value")).toBe("");
    expect(footer?.querySelector("script")).toBeNull();
    expect(html).not.toContain("turnstile");
    expect(html).not.toContain("challenges.cloudflare.com");
    expect(submit?.textContent).toBe("Subscribe");
    const status = footer?.querySelector('[data-slot="hraness-mailing-list-status"]');
    expect(status?.id).toBe("hraness-mailing-list-status");
    expect(status?.getAttribute("aria-atomic")).toBe("true");
    expect(status?.textContent).toBe("");
    expect(socialLinks.map((link) => link.getAttribute("href"))).toEqual(
      expectedSocialLinks.map(([, href]) => href),
    );
    expect(html.indexOf('data-slot="hraness-mailing-list-signup"')).toBeLessThan(
      html.indexOf('aria-label="Hraness links"'),
    );
    expect(socialLinks[0]?.getAttribute("aria-label")).toBe("Hraness on Substack");
  });

  test("renders the geo-gated cookie consent note hidden beside the social links", () => {
    const html = renderHranessSiteFooter({ mailingList: productMailingList });
    const { document } = parseHTML(html);
    const consent = document.querySelector('[data-slot="hraness-cookie-consent"]');
    const accept = consent?.querySelector('[data-slot="hraness-cookie-consent-accept"]');
    const learnMore = consent?.querySelector("details");
    const privacy = consent?.querySelector('a[href="https://hraness.com/privacy"]');

    expect(consent).not.toBeNull();
    expect(consent?.hasAttribute("hidden")).toBeTrue();
    expect(accept?.tagName).toBe("BUTTON");
    expect(accept?.getAttribute("type")).toBe("button");
    expect(accept?.textContent).toBe("Accept cookies");
    expect(learnMore?.querySelector("summary")?.textContent).toBe("Learn more");
    expect(learnMore?.textContent).toContain("no advertising or cross-site trackers");
    expect(privacy?.textContent).toBe("Privacy policy");
    expect(html.indexOf('data-slot="hraness-cookie-consent"')).toBeGreaterThan(
      html.indexOf('data-slot="hraness-mailing-list-signup"'),
    );
    expect(html.indexOf('data-slot="hraness-cookie-consent"')).toBeLessThan(
      html.indexOf('aria-label="Hraness links"'),
    );
  });

  test("keeps the consent note when the mailing list is omitted", () => {
    const html = renderHranessSiteFooter({ mailingList: noMailingList });
    const { document } = parseHTML(html);

    expect(document.querySelector('[data-slot="hraness-cookie-consent"]')).not.toBeNull();
    expect(document.querySelector("form")).toBeNull();
  });

  test("renders localized stable copy regardless of legacy variant inputs", () => {
    const html = renderHranessSiteFooter({
      mailingList: productMailingList,
      locale: "es-AR",
      variant: { layout: "button", copyStyle: "inviting", color: "orange", shimmer: true },
    });
    const { document } = parseHTML(html);
    const form = document.querySelector('form[data-slot="hraness-mailing-list-signup"]');
    const details = document.querySelector("details");
    const summary = details?.querySelector("summary");
    expect(form?.getAttribute("lang")).toBe("es-AR");
    expect(form?.getAttribute("dir")).toBe("ltr");
    expect(details?.getAttribute("data-layout")).toBe("button");
    expect(details?.getAttribute("data-presentation")).toBe("stable-modal-v1");
    expect(summary?.textContent).toBe("Recibir novedades por correo");
    expect(form?.querySelector('input[name="email"]')?.getAttribute("placeholder")).toBe("you@example.com");
    expect(form?.querySelector(".hraness-site-footer__shimmer")).toBeNull();
  });

  test("rejects malformed mailing-list audience IDs", () => {
    expect(() => renderHranessSiteFooter({
      mailingList: {
        audience: "UPPERCASE",
        kind: "signup",
      },
    })).toThrow("canonical lowercase slugs");
    expect(() => renderHranessSiteFooter({
      mailingList: {
        audience: "audience-name-that-is-too-long",
        kind: "signup",
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
    expect(footer?.textContent).not.toContain("by Hraness");
    expect(footer?.querySelector('input[name="audience"]')?.getAttribute("value"))
      .toBe("soundfish");
    expect(footer?.querySelectorAll(".hraness-site-footer__social-link")).toHaveLength(4);
  });

  test("lets a product retarget owned X and GitHub destinations without adding platforms", () => {
    const html = renderHranessSiteFooter({
      mailingList: noMailingList,
      social: aichartsSocial,
    });
    const { document } = parseHTML(html);
    const links = [...document.querySelectorAll(".hraness-site-footer__social-link")];

    expect(links.map((link) => [
      link.getAttribute("aria-label"),
      link.getAttribute("href"),
    ])).toEqual([
      ["Hraness on Substack", "https://substack.com/@hraness"],
      ["AI Charts on X", "https://x.com/aichartsio"],
      ["Hraness on LinkedIn", "https://www.linkedin.com/company/hraness"],
      ["AI Charts on GitHub", "https://github.com/hraness/aicharts"],
    ]);
    expect(html).not.toContain("bluesky");
    expect(html).not.toContain("bsky.app");
    expect(html).not.toContain("https://x.com/hraness");
    expect(html).not.toContain("https://github.com/hraness\"");
  });

  test("rejects invented platforms, invalid destinations, and extra override fields", () => {
    expect(() => renderHranessSiteFooter({
      mailingList: noMailingList,
      social: {
        bluesky: { href: "https://bsky.app/profile/hraness.bsky.social" },
      } as unknown as typeof aichartsSocial,
    })).toThrow("may only retarget substack, x, linkedin, or github");
    expect(() => renderHranessSiteFooter({
      mailingList: noMailingList,
      social: { x: { href: "https://x.com/hraness", title: "X" } } as unknown as typeof aichartsSocial,
    })).toThrow("may only set href and label");
    expect(() => renderHranessSiteFooter({
      mailingList: noMailingList,
      social: { x: { href: "https://twitter.com/aichartsio" } },
    })).toThrow("canonical https profile URLs");
    expect(() => renderHranessSiteFooter({
      mailingList: noMailingList,
      social: { github: { href: "http://github.com/hraness/aicharts" } },
    })).toThrow("canonical https profile URLs");
    expect(() => renderHranessSiteFooter({
      mailingList: noMailingList,
      social: { x: { href: "javascript:alert(1)" } },
    })).toThrow("canonical https profile URLs");
    expect(() => renderHranessSiteFooter({
      mailingList: noMailingList,
      social: { x: { href: "https://x.com/aichartsio", label: " <script>" } },
    })).toThrow("specific accessible names");
  });

  test("uses the exact raw Ra mark without image or mask dependencies", () => {
    const html = renderHranessSiteFooter({ mailingList: noMailingList });
    const { document } = parseHTML(html);
    const mark = document.querySelector('svg[data-slot="hraness-mark"]');
    const brand = document.querySelector('.hraness-site-footer__brand');

    expect(brand?.getAttribute("aria-label")).toBe("Hraness home");
    expect(brand?.getAttribute("href")).toBe("https://hraness.com/");
    expect(brand?.textContent).toBe("by Hraness");
    expect(document.querySelector('.hraness-site-footer__wordmark')).toBeNull();
    expect(mark?.getAttribute("viewBox")).toBe("0 0 512 512");
    expect(mark?.querySelectorAll("path")).toHaveLength(4);
    expect(mark?.querySelectorAll("circle")).toHaveLength(1);
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("mask")).toBeNull();
    expect(html).not.toContain("0thernet");
  });
});


test("legacy inline inputs retain one stable native disclosure and one uniquely labelled form", () => {
  const { document } = parseHTML(renderHranessSiteFooter({ mailingList: { kind: "signup", audience: "hraness" }, variant: { layout: "inline", copyStyle: "goblin", color: "blue", shimmer: false } }));
  const disclosure = document.querySelector('[data-slot="hraness-mailing-disclosure"]');
  expect(disclosure?.tagName).toBe("DETAILS");
  expect(disclosure?.hasAttribute("open")).toBeFalse();
  expect(disclosure?.querySelector("summary")?.textContent).toBe("Get email updates");
  expect(disclosure?.querySelector("summary")?.hasAttribute("aria-label")).toBeFalse();
  expect(disclosure?.querySelector("dialog")?.hasAttribute("open")).toBeTrue();
  expect(document.querySelectorAll("form")).toHaveLength(1);
  expect(document.querySelector('input[name="email"]')?.getAttribute("placeholder")).toBe("you@example.com");
  expect(document.querySelector('input[name="email"]')?.closest("label")?.textContent).toBe("Email address");
});
