import { describe, expect, test } from "bun:test";
import { parseHTML } from "linkedom";
import { renderToStaticMarkup } from "react-dom/server";
import { renderHranessSiteFooter, type HranessMailingListConfig, type SupportProfile } from "../src/index.js";
import { HranessSiteFooter } from "../src/react.js";

const support: SupportProfile = {
  id: "wrench", name: "Ghostget", updates: true,
  valueProposition: "Support ongoing development of precise web tools for agents.",
};

describe("optional product support", () => {
  for (const mailingList of [{ kind: "none" }, { kind: "account" }, { kind: "signup", audience: "wrench" }] as const satisfies readonly HranessMailingListConfig[]) {
    test(`preserves ${mailingList.kind} with a native, matching static and React handoff`, () => {
      const html = renderHranessSiteFooter({ mailingList, support });
      expect(renderToStaticMarkup(<HranessSiteFooter mailingList={mailingList} support={support} />)).toBe(html);
      const { document } = parseHTML(html);
      const link = document.querySelector('[data-slot="hraness-support-link"]')!;
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe("https://account.hraness.com/support?product=wrench&source=web#support");
      expect(link.textContent).toBe("Support");
      expect(link.getAttribute("aria-label")).toBe("Support Ghostget: optional paid membership");
      expect(link.getAttribute("title")).toContain(support.valueProposition);
      expect(link.getAttribute("target")).toBeNull();
      expect(document.querySelectorAll("form")).toHaveLength(mailingList.kind === "signup" ? 1 : 0);
      expect(document.querySelector('input[name="audience"]')?.getAttribute("value") ?? null).toBe(mailingList.kind === "signup" ? "wrench" : null);
      expect(document.querySelectorAll("script")).toHaveLength(0);
    });
  }

  test("does not infer a newsletter or support product", () => {
    const options = { mailingList: { kind: "none" } } as const;
    expect(renderHranessSiteFooter(options)).not.toContain("hraness-support-link");
    const { document } = parseHTML(renderHranessSiteFooter({ ...options, support: { ...support, updates: false } }));
    expect(document.querySelectorAll("form, input")).toHaveLength(0);
    expect(document.querySelector('[data-slot="hraness-support-link"]')).not.toBeNull();
  });

  test("rejects malformed profiles and escapes product-owned text", () => {
    for (const bad of [null, {}, { ...support, id: "wrench&email=secret" }, { ...support, name: "Ghostget\n" }, { ...support, email: "reader@example.test" }]) {
      expect(() => renderHranessSiteFooter({ mailingList: { kind: "none" }, support: bad as SupportProfile })).toThrow();
    }
    const { document } = parseHTML(renderHranessSiteFooter({ mailingList: { kind: "none" }, support: { ...support, name: 'Tools " & <Studio>', valueProposition: 'Support "our" <tools> & updates.' } }));
    const link = document.querySelector('[data-slot="hraness-support-link"]')!;
    expect(link.getAttribute("aria-label")).toBe('Support Tools " & <Studio>: optional paid membership');
    expect(link.getAttribute("title")).toContain('Support "our" <tools> & updates.');
    expect(link.children).toHaveLength(0);
  });
});
